import fs from 'fs';
import path from 'path';
import { nftAttributeItem } from './types';

async function main() {
  const mergeImages = require('merge-images');
  const { Canvas, Image } = require('canvas');

  // Add NFT parts directories relative path
  const baseFolderMap = [
    '../assets/bg',
    '../assets/bottom',
    '../assets/snapshot',
    '../assets/pfp',
    '../assets/message',
    '../assets/paint',
  ];

  const bg = [];
  const bottom = [];
  const snapshot = [];
  const pfp = [];
  const message = [];
  const paint = [];

  for (const folder of baseFolderMap) {
    const dirPath = path.resolve(__dirname, folder);
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (folder.includes('bg')) {
        bg.push(path.resolve(dirPath, file));
      } else if (folder.includes('bottom')) {
        bottom.push(path.resolve(dirPath, file));
      } else if (folder.includes('snapshot')) {
        snapshot.push(path.resolve(dirPath, file));
      } else if (folder.includes('pfp')) {
        pfp.push(path.resolve(dirPath, file));
      } else if (folder.includes('message')) {
        message.push(path.resolve(dirPath, file));
      } else if (folder.includes('paint')) {
        paint.push(path.resolve(dirPath, file));
      }
    }
  }

  // merge image bg > snapshot > paint > pfp > message > bottom
  // with recursive merge
  const attributes: { [index: string | number]: nftAttributeItem[] } = {};
  const map = new Map<string, boolean>();

  for (let i = 1; i <= 9140; i++) {
    const rand1 = Math.floor(Math.random() * bg.length);
    const rand2 = Math.floor(Math.random() * snapshot.length);
    const rand3 = Math.floor(Math.random() * paint.length);
    const rand4 = Math.floor(Math.random() * pfp.length);
    const rand5 = Math.floor(Math.random() * message.length);
    const rand6 = Math.floor(Math.random() * bottom.length);

    const bgImage = bg[rand1];
    const snapshotImage = snapshot[rand2];
    const paintImage = paint[rand3];
    const pfpImage = pfp[rand4];
    const messageImage = message[rand5];
    const bottomImage = bottom[rand6];

    const key = `${rand1}-${rand2}-${rand3}-${rand4}-${rand5}-${rand6}`;

    if (map.has(key)) {
      i--;
      continue;
    }

    map.set(key, true);

    // get each files
    const bgLayer = fs.readFileSync(bgImage);
    const snapshotLayer = fs.readFileSync(snapshotImage);
    const paintLayer = fs.readFileSync(paintImage);
    const pfpLayer = fs.readFileSync(pfpImage);
    const messageLayer = fs.readFileSync(messageImage);
    const bottomLayer = fs.readFileSync(bottomImage);

    const mergedImage = await mergeImages(
      [
        { src: bgLayer },
        { src: snapshotLayer },
        { src: paintLayer },
        { src: pfpLayer },
        { src: messageLayer },
        { src: bottomLayer },
      ],
      {
        Canvas: Canvas,
        Image: Image,
      },
    );

    fs.writeFileSync(
      path.resolve(__dirname, `../output/${i}.png`),
      mergedImage.replace(/^data:image\/png;base64,/, ''),
      'base64',
    );

    attributes[i] = [
      {
        trait_type: 'Background',
        value: bgImage.split('/').pop() || '',
      },
      {
        trait_type: 'Snapshot',
        value: snapshotImage.split('/').pop() || '',
      },
      {
        trait_type: 'Paint',
        value: paintImage.split('/').pop() || '',
      },
      {
        trait_type: 'PFP',
        value: pfpImage.split('/').pop() || '',
      },
      {
        trait_type: 'Message',
        value: messageImage.split('/').pop() || '',
      },
      {
        trait_type: 'Bottom',
        value: bottomImage.split('/').pop() || '',
      },
    ];

    console.log('token Id', i);
  }

  fs.writeFileSync(
    path.resolve(__dirname, `../output/metadata.json`),
    JSON.stringify(attributes, null, 2),
  );
}

main()
  .then(async () => {
    console.log('✅ Script run Success');
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
