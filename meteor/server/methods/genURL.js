import {
    Model
} from '../../lib/collections/model'
import {
    Link
} from '../../lib/collections/link'
import {
    containsValidSecret
} from "../../lib/editor/text"
import {
    extractSecrets
} from "../lib/secrets"

Meteor.methods({
    /**
     Meteor method to get persistent links to share an Alloy model. Only
     generates private link if secrets are present. If the model contains
     secrets, will become a new derivation root (although it still registers
     the derivation).

     @param {String} code the Alloy model to be shared
     @param {String} currentModelId the id of the current model

     @return The 'id' of the model link, used in Share Model option
     */
    genURL: function(code, currentModelId) {
        console.log("** generate urls..")

        // a new model is always created, regardless of having secrets or not
        let model = {
            code: code,
            time: new Date().toLocaleString(),
            derivationOf: currentModelId
        }

        // insert new model
        let modelId = Model.insert(model);

        // generate the public link
        let publicLinkId = Link.insert({
            model_id: modelId,
            private: false
        });

        // generate the private link if secrets are present
        let privateLinkId
        let original
        if (containsValidSecret(code)) {
            original = modelId
            privateLinkId = Link.insert({
                model_id: modelId,
                private: true
            });
        } else {
            original = Model.findOne(currentModelId).original
        }

        Model.update({ _id : modelId },{$set: {original : original}})

        return {
            public: publicLinkId,
            // will be undefined if no secret is present
            private: privateLinkId,
            last_id: modelId
        }
    }
});