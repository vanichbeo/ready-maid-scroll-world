const base = 'https://ready-maid-scroll-world-7pp6hk62l-readymaid.vercel.app/assets/';
const assets = [
  'duke.jpg',
  'duke-thumbnails/experience-vs-no-experience.png',
  'duke-thumbnails/repeated-instructions.png',
  'duke-thumbnails/housework-interview-question.png',
  'duke-thumbnails/quiet-helper-warning.png',
  'duke-thumbnails/interview-performance.png',
  'duke-thumbnails/first-interview-question.png',
  'duke-videos/experience-vs-no-experience.mp4',
  'duke-videos/repeated-instructions.mp4',
  'duke-videos/housework-interview-question.mp4',
  'duke-videos/quiet-helper-warning.mp4',
  'duke-videos/interview-performance.mp4',
  'duke-videos/first-interview-question.mp4'
];

const failures = [];
for (const asset of assets) {
  try {
    const response = await fetch(base + asset, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!response.ok) failures.push(`${asset}: HTTP ${response.status}`);
  } catch (error) {
    failures.push(`${asset}: ${error.message}`);
  }
}
if (failures.length) {
  console.error('Meet DUKE remote media check FAILED:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Meet DUKE media check PASS — ${assets.length} protected remote assets returned success.`);
