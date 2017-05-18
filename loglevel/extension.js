(function () {

    function readProfiles() {
        if (core.environment.standalone) {
            chooseLogLevel(null);
            readLogLevel();
        } else {
            let operation = core.operation(hal.dmr.ResourceAddress.root(), "read-children-names")
                .param("child-type", "profile")
                .build();
            core.dispatcher.execute(operation, result => {
                chooseLogLevel(result.asList().map(profile => profile.asString()));
                if (selectedProfile) {
                    selectProfile(selectedProfile);
                }
            });
        }
    }

    function chooseLogLevel(profiles) {
        let dialog = core.dialog("Choose Log Level")
            .add(content[0])
            // .size("LARGE")
            .okCancel(changeLogLevel)
            .build();
        dialog.show();

        if (core.environment.standalone) {
            $("#log-level-profile-form-group").hide();
        } else {
            $("#log-level-profile-btn-group").empty();
            profiles.forEach(profile => {
                $(`<button data-profile="${profile}" type="button" class="btn btn-default">${profile}</button>`)
                    .appendTo("#log-level-profile-btn-group");
            });
        }
        $("button[data-profile]").click((event) => selectProfile(event.currentTarget.dataset.profile));
        $("button[data-log-level]").click((event) => selectLogLevel(event.currentTarget.dataset.logLevel));
    }

    function readLogLevel() {
        let operation = core.operation(rootLoggerAddress(), "read-attribute")
            .param("name", "level")
            .build();
        core.dispatcher.execute(operation, result => selectLogLevel(result.asString()));
    }

    function selectProfile(profile) {
        selectedProfile = profile;
        $("button[data-profile='" + profile + "']").addClass("btn-primary");
        $("button[data-profile]").not("[data-profile='" + profile + "']").removeClass("btn-primary");
        if (!core.environment.standalone) {
            readLogLevel();
        }
    }

    function selectLogLevel(logLevel) {
        selectedLogLevel = logLevel;
        $("button[data-log-level='" + logLevel + "']").addClass("btn-primary");
        $("button[data-log-level]").not("[data-log-level='" + logLevel + "']").removeClass("btn-primary");
    }

    function changeLogLevel() {
        let changeRootLogger = core.operation(rootLoggerAddress(), "write-attribute")
            .param("name", "level")
            .param("value", selectedLogLevel)
            .build();
        let changeConsoleHandler = core.operation(consoleHandlerAddress(), "write-attribute")
            .param("name", "level")
            .param("value", selectedLogLevel)
            .build();

        let composite = new hal.dmr.Composite();
        composite.addOperation(changeRootLogger);
        composite.addOperation(changeConsoleHandler);

        core.dispatcher.executeComposite(composite, () => {
            if (core.environment.standalone) {
                core.success(`Log level successfully changed to <strong>${selectedLogLevel}</strong>`);
            } else {
                core.success(`Log level in profile <strong>${selectedProfile}</strong> successfully changed to <strong>${selectedLogLevel}</strong>`);
            }
        });
    }

    function rootLoggerAddress() {
        return core.environment.standalone ? "/subsystem=logging/root-logger=ROOT" : `/profile=${selectedProfile}/subsystem=logging/root-logger=ROOT`;
    }

    function consoleHandlerAddress() {
        return core.environment.standalone ? "/subsystem=logging/console-handler=CONSOLE" : `/profile=${selectedProfile}/subsystem=logging/console-handler=CONSOLE`;
    }



    var selectedProfile = selectedProfile || null;
    var selectedLogLevel = null;

    let core = hal.core.Core.getInstance();
    // to keep it simple we only add the most common log levels
    let content = $(`
    <section class="margin-top-large">
        <div class="form form-horizontal">
            <div id="log-level-profile-form-group" class="form-group">
                <label class="control-label hal-form-label" title="Profile">Profile</label>
                <div class="hal-form-input">
                    <div id="log-level-profile-btn-group" class="btn-group">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label class="control-label hal-form-label" title="Level">Level</label>
                <div class="hal-form-input">
                    <div class="btn-group">
                        <button data-log-level="ALL" type="button" class="btn btn-default">ALL</button>
                        <button data-log-level="DEBUG" type="button" class="btn btn-default">DEBUG</button>
                        <button data-log-level="INFO" type="button" class="btn btn-default">INFO</button>
                        <button data-log-level="WARN" type="button" class="btn btn-default">WARN</button>
                        <button data-log-level="ERROR" type="button" class="btn btn-default">ERROR</button>
                        <button data-log-level="OFF" type="button" class="btn btn-default">OFF</button>
                    </div>
                </div>
            </div>
        </div>
    </section>`);

    core.extensionRegistry.register(hal.core.Extension.header("loglevel", "Change Log Level", readProfiles));

})();
