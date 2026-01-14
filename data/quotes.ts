import { Quote } from '@/types';

export const sampleQuotes: Quote[] = [
  {
    id: '1',
    text: 'اللهم إني أسألك العفو والعافية في الدنيا والآخرة',
    translation: 'O Allah, I ask You for pardon and well-being in this life and the next',
    category: 'peace',
    isLiked: false,
    date: new Date().toISOString(),
  },
  {
    id: '2',
    text: 'اللهم اهدني فيمن هديت، وعافني فيمن عافيت، وتولني فيمن توليت',
    translation: 'O Allah, guide me with those whom You have guided, grant me well-being with those whom You have granted well-being',
    category: 'growth',
    isLiked: false,
    date: new Date().toISOString(),
  },
  {
    id: '3',
    text: 'اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل',
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness',
    category: 'anxiety',
    isLiked: false,
    date: new Date().toISOString(),
  },
  {
    id: '4',
    text: 'اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين',
    translation: 'O Allah, I hope for Your mercy, so do not leave me to myself even for a blink of an eye',
    category: 'peace',
    isLiked: false,
    date: new Date().toISOString(),
  },
  {
    id: '5',
    text: 'اللهم إني أسألك من الخير كله عاجله وآجله ما علمت منه وما لم أعلم',
    translation: 'O Allah, I ask You for all that is good, both immediate and that which is delayed, what I know and what I do not know',
    category: 'growth',
    isLiked: false,
    date: new Date().toISOString(),
  },
];

