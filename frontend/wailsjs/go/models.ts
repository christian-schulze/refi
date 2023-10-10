export namespace config {
	
	export class ConfigObject {
	    docSetsFeedUrl: string;
	    docSetsIconsUrl: string;
	    docSetsPath: string;
	
	    static createFrom(source: any = {}) {
	        return new ConfigObject(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.docSetsFeedUrl = source["docSetsFeedUrl"];
	        this.docSetsIconsUrl = source["docSetsIconsUrl"];
	        this.docSetsPath = source["docSetsPath"];
	    }
	}
	export class LoadSettingsResult {
	    config: ConfigObject;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new LoadSettingsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.config = this.convertValues(source["config"], ConfigObject);
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace db {
	
	export class DocSetRow {
	    id: number;
	    name: string;
	    type: string;
	    path: string;
	    score: number;
	
	    static createFrom(source: any = {}) {
	        return new DocSetRow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.path = source["path"];
	        this.score = source["score"];
	    }
	}
	export class SearchDocSetResult {
	    results: DocSetRow[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new SearchDocSetResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.results = this.convertValues(source["results"], DocSetRow);
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace docsets {
	
	export class GetDownloadedDocSetPaths {
	    docSetPaths: string[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new GetDownloadedDocSetPaths(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.docSetPaths = source["docSetPaths"];
	        this.error = source["error"];
	    }
	}
	export class ReadFeedArchiveResult {
	    docSetFeed: {[key: string]: string};
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ReadFeedArchiveResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.docSetFeed = source["docSetFeed"];
	        this.error = source["error"];
	    }
	}

}

export namespace fs {
	
	export class ReadDirResult {
	    dirEntries: any[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ReadDirResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dirEntries = source["dirEntries"];
	        this.error = source["error"];
	    }
	}
	export class ReadTextFileResult {
	    data: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ReadTextFileResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = source["data"];
	        this.error = source["error"];
	    }
	}

}

export namespace search {
	
	export class SearchResult {
	    id: number;
	    name: string;
	    type: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new SearchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.path = source["path"];
	    }
	}
	export class SearchDocSetResult {
	    results: SearchResult[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new SearchDocSetResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.results = this.convertValues(source["results"], SearchResult);
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

