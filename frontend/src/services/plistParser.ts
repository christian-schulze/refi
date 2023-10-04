import { ReadTextFile } from '../../wailsjs/go/fs/FS';

type Value = string | number | boolean | Date | Data | ValueArray;
type ValueArray = Array<Value>;
interface Data {
  [key: string]: Value;
}

const parseValueNode = (valueNode: Element | null): Value => {
  if (valueNode) {
    switch (valueNode.nodeName) {
      case 'string':
      case 'data':
        return valueNode.innerHTML;
      case 'real':
        return Number.parseFloat(valueNode.innerHTML);
      case 'integer':
        return Number.parseInt(valueNode.innerHTML);
      case 'true':
        return true;
      case 'false':
        return false;
      case 'date':
        return new Date(valueNode.innerHTML);
      case 'dict':
        return parseDictionaryNode(valueNode);
      case 'array':
        return Array.from(valueNode.childNodes).map((childNode: ChildNode) =>
          parseValueNode(childNode as Element),
        );
      default:
        console.error('unsupported plist node', valueNode.nodeName);
    }
  }
  console.error('undefined plist node');
  return {};
};

const parseDictionaryNode = (node: Element | null): Data => {
  const data: Data = {};
  node?.querySelectorAll('key').forEach((keyNode) => {
    let nextSibling = keyNode.nextSibling;
    while (nextSibling?.nodeName === '#text') {
      nextSibling = nextSibling.nextSibling;
    }
    data[keyNode.innerHTML] = parseValueNode(nextSibling as Element);
  });

  return data;
};

export const readPListFile = async (path: string): Promise<Data> => {
  const xml = await ReadTextFile(path);
  const domParser = new DOMParser();
  const infoPListDocument = domParser.parseFromString(xml, 'application/xml');

  return parseDictionaryNode(infoPListDocument.querySelector('plist > dict'));
};
