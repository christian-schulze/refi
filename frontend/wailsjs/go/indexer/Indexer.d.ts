// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {indexer} from '../models';
import {context} from '../models';

export function CloseIndex(arg1:string):Promise<string>;

export function CreateDocSetIndex(arg1:string,arg2:string):Promise<string>;

export function SearchDocSet(arg1:string,arg2:string):Promise<indexer.SearchDocSetResult>;

export function Startup(arg1:context.Context):Promise<void>;