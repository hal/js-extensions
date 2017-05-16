(function () {

    let core = hal.core.Core.getInstance();
    let whoami = hal.core.Extension.header("whoami", "Who am I?",

        function () {
            let operation = core.operation(hal.dmr.ResourceAddress.root(), "whoami")
                .param("verbose", true)
                .build();
            core.dispatcher.execute(operation, result => {
                let username = hal.dmr.ModelNodeHelper.failSafeGet(result, "identity/username").asString();
                let realm = hal.dmr.ModelNodeHelper.failSafeGet(result, "identity/realm").asString();
                let roles = hal.dmr.ModelNodeHelper.failSafeList(result, "mapped-roles")
                    .map(role => role.asString())
                    .join(", ");
                alert(`You are user ${username} at ${realm}.
Mapped roles: [${roles}].`);
            });
        });

    core.extensionRegistry.register(whoami);

}());
