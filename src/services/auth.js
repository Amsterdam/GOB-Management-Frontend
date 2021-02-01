import jwtDecode from 'jwt-decode';
import {CONNECT_TO_LOCAL_API} from "./config";

const GOB_ADMIN = "gob_adm";
const GOB_USER = "gob_adm_r";
const REQUIRED_ROLES = [GOB_ADMIN, GOB_USER];

export function runsLocally() {
  return window.location.hostname.includes("localhost");
}

export function runsOnTest() {
  return window.location.hostname.includes("test");
}

export function runsOnAcceptance() {
  return window.location.hostname.includes("acc");
}

export function runsOnProduction() {
  return !(runsLocally() || runsOnTest() || runsOnAcceptance());
}

const setupKeycloack = () => {
  const config = {
    realm: runsOnProduction() ? "datapunt" : "datapunt-acc",
    url: "https://iam.amsterdam.nl/auth",
    clientId: "iris"
  };
  const keycloak = (window.Keycloak && window.Keycloak(config)) || {};

  const init = async () => {
    const options = {
      promiseType: "native", // To enable async/await
      "check-sso": false, // To enable refresh token
      checkLoginIframe: false // To enable refresh token
    };
    if (runsLocally() && CONNECT_TO_LOCAL_API) {
      // Note that login may be activated if needed, localhost is an accepted host for the -acc realm
      console.warn("Local execution, no login required");
    } else {
      options.onLoad = "login-required"; // Login on application start and browser refresh
    }

    return keycloak.init(options);
  };

  const isReady = new Promise(async (resolve, reject) => {
    // This is executed during load of this module
    // The promise is awaited in the other methods to be sure that keycloak has been initialised
    try {
      await init();
      resolve();
    } catch (e) {
      reject();
    }
  });

  const login = async () => {
    await isReady;
    return keycloak.login();
  };

  const logout = async () => {
    await isReady;
    return keycloak.logout();
  };

  const userInfo = async () => {
    await isReady;
    if (keycloak.authenticated) {
      return keycloak.loadUserInfo();
    } else {
      return null;
    }
  };

  const getUserRoles = () => {
    try {
      const jwt = jwtDecode(keycloak.token);
      return jwt.realm_access.roles || [];
    } catch (e) {
      return [];
    }
  };

  const isAdmin = () => {
    if (runsLocally()) {
      return true;
    } else {
      const userRoles = getUserRoles();
      return userRoles.includes(GOB_ADMIN);
    }
  };

  const token = async () => {
    await isReady;
    return keycloak.token;
  };

  var keepAlive = null;

  const autoRefreshToken = turnOn => {
    // Refresh the token automatically once the user has been authenticated
    // Turn off when the user has logged out
    const minValidity = 30; // Token should be valid for at least the next 30 seconds
    const updateInterval = minValidity * 0.75; // Keep token valid by checking regularly
    if (turnOn) {
      // Start a token updater, if not yet running
      keepAlive =
        keepAlive ||
        setInterval(
          () => keycloak.updateToken(minValidity),
          updateInterval * 1000
        );
    } else {
      keepAlive && clearInterval(keepAlive);
      keepAlive = null;
    }
  };

  keycloak.onReady = authenticated => {
    console.log("Keycloak ready, authenticated", authenticated);
  };

  keycloak.onAuthSuccess = function() {
    const userRoles = getUserRoles();
    if (
      !REQUIRED_ROLES.some(requiredRole => userRoles.includes(requiredRole))
    ) {
      console.error(`Insufficient rights: ${userRoles.join(", ")}`);
      keycloak.logout();
    } else {
      autoRefreshToken(true);
    }
  };

  keycloak.onAuthError = function() {
    console.log("Auth error");
    autoRefreshToken(false);
  };

  keycloak.onAuthRefreshSuccess = function() {
    console.log("Auth refresh success");
  };

  keycloak.onAuthRefreshError = function() {
    console.log("Auth refresh error");
    autoRefreshToken(false);
  };

  keycloak.onAuthLogout = function() {
    console.log("Auth logout");
    autoRefreshToken(false);
  };

  keycloak.onTokenExpired = function() {
    // This should never happen
    console.log("Unexpected: Token expired");
    autoRefreshToken(false);
    logout()
  };

  return {
    login,
    token,
    userInfo,
    isAdmin,
    logout
  };
};

export default setupKeycloack();
