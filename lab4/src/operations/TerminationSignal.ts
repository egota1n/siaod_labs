export class TerminationSignal {
    readonly type = "termination";
    constructor(public siteId: string) {}

    getType() {
        return this.type;
    }
}