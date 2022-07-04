import {getCatalogCollections as _getCatalogCollections,
    catalogOnlyJobs, collectionOptionalJobs, createJob} from "../../../services/gob";
import auth from "../../../services/auth";

export async function getCatalogCollections() {
    const exclude = ['rel', 'test_catalogue', 'qa', 'wkpb']
    let catalogCollections = await _getCatalogCollections();
    return Object.keys(catalogCollections)
        .filter(catalog => !exclude.includes(catalog))
        .reduce((obj, catalog) => {
            obj[catalog] = catalogCollections[catalog];
            return obj;
        }, {});
}

export function canStartJob(action, catalog, collection) {
    action = action && action.toLowerCase();
    return (
        action &&
        (catalogOnlyJobs.includes(action) ||
            collectionOptionalJobs.includes(action) ||
            (catalog && collection && collection.length))
    );
}

export async function startJob(action, catalog, collection, product) {
    let user = "onbekende gebruiker";
    const userInfo = await auth.userInfo();
    if (userInfo) {
        user = userInfo.preferred_username;
    }
    user = `${user} (Iris)`;

    let result = await createJob(
        action,
        catalog,
        collection,
        product,
        user
    );

    if (result.ok) {
        const info = JSON.parse(result.text);
        const values = Object.values(info).join(" ");
        result.text = `${action} ${values} started`;
    } else {
        result.text = `${action} ${catalog} {collection} failed`;
    }
    return result
}
