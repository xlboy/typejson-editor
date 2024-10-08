import { compress, decompress } from 'brotli';
import _ from 'lodash';

// 示例文本
const text = _.shuffle('这是一个需要压缩的长文本。可以重复多次以展示压缩效果。'.repeat(1000).split('')).join('');

debugger;
// 压缩
console.time('Compression');
const compressed = compress(Buffer.from(text));
console.timeEnd('Compression');

// 输出原始大小和压缩后的大小
console.log(`Original size: ${text.length} bytes`);
console.log(`Compressed size: ${compressed.length} bytes`);
console.log(`Compression ratio: ${((compressed.length / text.length) * 100).toFixed(2)}%`);

// 解压缩
// console.time('Decompression');
// const decompressed = decompress(compressed);
// console.timeEnd('Decompression');

// // 验证解压缩结果
// const decompressedText = decompressed.toString();
// console.log('Decompression successful:', decompressedText === text);

// 如果需要将压缩后的数据转换为字符串（例如用于存储或传输）
const compressedBase64 = Buffer.from(compressed).toString('base64');
console.log('Compressed data as Base64:', compressedBase64);

// 从 Base64 字符串恢复并解压缩
const recoveredCompressed = Buffer.from(compressedBase64, 'base64');
const recoveredText = Buffer.from(decompress(recoveredCompressed)).toString();
console.log('Recovery from Base64 successful:', recoveredText === text);
