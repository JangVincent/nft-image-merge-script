import fs from 'fs';
import path from 'path';
import { nftAttributeItem } from './types';

async function main() {
  const mergeImages = require('merge-images');
  const { Canvas, Image } = require('canvas');

  // ======================
  //  Layer Base Paths
  // ======================
  const baseFolder = {
    bg: path.resolve(__dirname, '../assets/BG'),
    princess: path.resolve(__dirname, '../assets/princess'),
    frame: path.resolve(__dirname, '../assets/Frame'),
  };

  const outputDir = path.resolve(__dirname, '../output');
  fs.mkdirSync(outputDir, { recursive: true });

  // ======================
  //  Weighted Tables
  // ======================
  const baseCharacters = [
    { name: 'aomi.png', weight: 14 },
    { name: 'sayaka.png', weight: 12 },
    { name: 'yume.png', weight: 14 },
    { name: 'shiori.png', weight: 12 },
    { name: 'hana.png', weight: 10 },
    { name: 'rika.png', weight: 10 },
    { name: 'aoi.png', weight: 8 },
    { name: 'yui.png', weight: 8 },
    { name: 'reina.png', weight: 6 },
    { name: 'shinobu.png', weight: 6 },
  ];

  const backgrounds = [
    { name: '1-Nature.png', weight: 9 },
    { name: '2-Wine.png', weight: 9 },
    { name: '3-Earth.png', weight: 9 },
    { name: '4-Darkness.png', weight: 9 },
    { name: '5-Neutral.png', weight: 9 },
    { name: '6-Beige.png', weight: 9 },
    { name: '7-Breeze.png', weight: 9 },
    { name: '8-Forest.png', weight: 9 },
    { name: '9-Field.png', weight: 9 },
    { name: '10-Steel.png', weight: 9 },
    { name: '11-Special_Aurora.png', weight: 1 },
    { name: '12-Special_Jungle.png', weight: 1 },
    { name: '13-Special_Sun.png', weight: 1.5 },
    { name: '14-Special_Lollipop.png', weight: 1.5 },
    { name: '15-Special_Deep.png', weight: 1.5 },
    { name: '16-Special_Jazz.png', weight: 1.5 },
    { name: '17-Rare_Breeze.png', weight: 0.5 },
    { name: '18-Rare_Ultraviolet.png', weight: 0.5 },
    { name: '19-Rare_Gold.png', weight: 0.5 },
  ];

  const frames = [
    { name: 'Frame_0-None.png', weight: 40 },
    { name: 'Frame_1-A.png', weight: 9 },
    { name: 'Frame_2-B.png', weight: 9 },
    { name: 'Frame_3-C.png', weight: 9 },
    { name: 'Frame_4-D.png', weight: 6 },
    { name: 'Frame_5-E.png', weight: 6 },
    { name: 'Frame_6-F.png', weight: 6 },
    { name: 'Frame_7-G.png', weight: 6 },
    { name: 'Frame_8-H.png', weight: 3 },
    { name: 'Frame_9-I.png', weight: 3 },
    { name: 'Frame_10-J.png', weight: 3 },
  ];

  const utilities = [
    { name: 'None', weight: 74 },
    { name: 'Shield', weight: 3 },
    { name: 'Mines', weight: 3 },
    { name: 'Health', weight: 5 },
    { name: 'Experience', weight: 5 },
    { name: 'Gold', weight: 10 },
  ];

  // ======================
  //  Weighted Random Helper
  // ======================
  function weightedRandom<T extends { name: string; weight: number }>(
    items: T[],
  ): T {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * total;
    for (const item of items) {
      rand -= item.weight;
      if (rand <= 0) return item;
    }
    return items[items.length - 1];
  }

  // ======================
  //  Generation Loop
  // ======================
  const map = new Set<string>();
  const TOTAL = 10000;

  for (let i = 1; i <= TOTAL; i++) {
    const princess = weightedRandom(baseCharacters);
    const bg = weightedRandom(backgrounds);
    const frame = weightedRandom(frames);
    const utility = weightedRandom(utilities);

    const key = `${princess.name}-${bg.name}-${frame.name}-${utility.name}`;
    if (map.has(key)) {
      i--;
      continue;
    }
    map.add(key);

    // Image merge order: BG → Princess → Frame
    const merged = await mergeImages(
      [
        { src: path.join(baseFolder.bg, bg.name) },
        { src: path.join(baseFolder.princess, princess.name) },
        { src: path.join(baseFolder.frame, frame.name) },
      ],
      { Canvas, Image },
    );

    fs.writeFileSync(
      path.join(outputDir, `${i}.png`),
      merged.replace(/^data:image\/png;base64,/, ''),
      'base64',
    );

    const metadata: nftAttributeItem[] = [
      { trait_type: 'Background', value: bg.name },
      { trait_type: 'Princess', value: princess.name },
      { trait_type: 'Frame', value: frame.name },
      { trait_type: 'Utility', value: utility.name },
    ];

    fs.writeFileSync(
      path.join(outputDir, `${i}.json`),
      JSON.stringify(metadata, null, 2),
    );

    if (i % 100 === 0) console.log(`Generated ${i}/${TOTAL}`);
  }

  console.log('✅ All 10,000 NFTs generated successfully!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
