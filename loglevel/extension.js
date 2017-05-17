(function () {

    var profile;
    let core = hal.core.Core.getInstance();
    let loglevel = hal.core.Extension.header("loglevel", "Change Loglevel", () => {
        alert("Not yet implemented");
    });
    core.extensionRegistry.register(loglevel);

    function changeLogLevel(level) {
        let rootLoggerAddress = core.environment.standalone
            ? "/subsystem=logging/root-logger=ROOT"
            : `/profile=${profile}/subsystem=logging/root-logger=ROOT`;
        let changeRootLogger = core.operation(rootLoggerAddress, "write-attribute")
            .param("name", "level")
            .param("value", level)
            .build();

        let consoleHandlerAddress = core.environment.standalone
            ? "/subsystem=logging/console-handler=CONSOLE"
            : `/profile=${profile}//subsystem=logging/console-handler=CONSOLE`;
        let changeConsoleHandler = core.operation(consoleHandlerAddress, "write-attribute")
            .param("name", "level")
            .param("value", level)
            .build();

        let composite = new hal.dmr.Composite();
        composite.addOperation(changeRootLogger);
        composite.addOperation(changeConsoleHandler);
        core.dispatcher.executeComposite(composite, (result) => {

        });
    }

}());
