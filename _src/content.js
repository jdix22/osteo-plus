/* All page copy for the OSTEO+ site, taken from osteo-plus.ca (Wix) and its Jane booking page,
   lightly tidied for grammar. Business facts (address, hours, team ids) live in assets/js/shared.js. */
'use strict';

const HST = 'HST applicable based on service';
const NO_HST = 'No HST';

// Prices exactly as published on osteo-plus.ca/pricing.
// Prices from the clinic's Jane booking page (osteo-plus.janeapp.com), 5 Nov 2026. Free 15-minute consults are listed separately.
const PRICING = [
  { service: 'osteopathy', name: 'Osteopathy', rows: [['30 min', 100], ['45 min', 125], ['60 min', 155]], note: 'New-patient initial assessment: 60 min, $155.', tax: HST },
  { service: 'physiotherapy', name: 'Physiotherapy', rows: [['60 min initial assessment', 150], ['30 min follow-up', 100], ['45 min follow-up', 125]], note: 'Teens: same rates for the initial assessment and 30 min follow-up.', tax: NO_HST },
  { service: 'athletic-therapy', name: 'Athletic Therapy', rows: [['30 min', 90], ['45 min', 110], ['60 min', 140]], note: 'New-patient initial assessment: 60 min, $140.', tax: HST },
  { service: 'massage-therapy', name: 'Massage Therapy', rows: [['30 min', 90], ['45 min', 110], ['60 min', 130], ['90 min', 170]], note: 'Same rates for relaxation and soft tissue therapy. Kids/teen massage: 30 min $90, 45 min $110.', tax: HST },
  { service: 'massage-therapy', id: 'prenatal-massage', name: 'Pre/Post-Natal Massage', rows: [['60 min', 135], ['90 min', 175]], tax: HST },
  { service: 'massage-therapy', id: 'tri', name: 'Therapeutic Rehab Integration (TRI)', rows: [['30 min', 95], ['45 min', 115], ['60 min', 135]], tax: HST },
  { service: 'therapeutic-sports-massage', name: 'Therapeutic Sports Massage', rows: [['30 min', 90], ['45 min', 110], ['60 min', 130]], note: 'Kids/teen sessions: 30 min $90, 45 min $110.', tax: HST },
  { service: 'tmj', name: 'TMJ/TMD Treatment', rows: [['45 min initial assessment', 110], ['30 min treatment', 90]], tax: HST },
  { service: 'acupuncture', name: 'Acupuncture', rows: [['30 min', 80], ['45 min', 100], ['60 min', 120]], note: 'New-patient initial assessment: 60 min, $120.', tax: NO_HST },
  { service: 'lymphatic-drainage-massage', name: 'Brazilian Lymphatic Drainage', rows: [['60 min buccal sculpting', 165], ['60 min', 175], ['90 min full body', 240], ['120 min lymphatic + buccal', 325]], tax: HST },
  { service: 'naturopathy', name: 'Naturopathy', rows: [['75 min adult initial consult', 220], ['60 min child/teen initial (0–17)', 200], ['30 min follow-up', 120], ['45 min follow-up', 150]], note: 'In person or virtual.', tax: NO_HST },
  { service: 'fascial-stretch-therapy', name: 'Fascial Stretch Therapy', rows: [['30 min upper or lower body', 80], ['45 min full body', 100], ['60 min full body', 120], ['75 min full body', 140]], tax: HST }
];

const PREP_COMMON = {
  intake: 'Fill out the online intake form before your first visit and create an online profile.',
  imaging: 'If you have diagnostic imaging reports (X-ray, ultrasound, MRI), upload them to your online profile or bring a copy to your appointment.',
  meal: 'Avoid eating a big meal 2–3 hours before treatment.',
  time: 'Arrive on time so you get the full length of your appointment.',
  after: 'After any treatment, hydrate, get plenty of sleep, and keep any exercise gentle: take a walk, stretch or do gentle yoga. Epsom salt baths are also encouraged for muscle relaxation.'
};

const NOT_MEDICINE = role => `The number and frequency of sessions varies with the injury or condition. Our ${role} do not diagnose or practise medicine, nor do we attempt to treat disease. If you are concerned about a medical condition, always consult your physician before starting treatment.`;

/* Service pages. Sections are optional; each list item is plain text. */
const SERVICE_PAGES = {
  osteopathy: {
    title: 'Osteopathy in Thornhill',
    metaTitle: 'Osteopathy in Thornhill | Manual Osteopath | OSTEO+',
    desc: 'Manual osteopathy at OSTEO+ in Thornhill for back, neck and joint pain, headaches and chronic pain. 30, 45 or 60 min sessions from $100. Book online.',
    q: 'What is osteopathy?',
    what: [
      'Osteopathy is a form of manual therapy that focuses on the relationship between the structure of the body and the way it functions. It is based on the principle that your health depends on your muscles, bones, ligaments and connective tissues working together.',
      'Manual osteopathic practitioners use a range of techniques, including physical mobilization, massage and stretching, to assess and treat musculoskeletal conditions and improve overall health. The goals include relief from muscle tension, more mobile joints, healing from injury, better posture and improved mental well-being, using a safe, effective and non-invasive approach.'
    ],
    helps: ['Back pain', 'Neck pain', 'Joint pain', 'Headaches and migraines', 'Sports injuries', 'Postural imbalances', 'Chronic pain'],
    prep: [PREP_COMMON.intake, PREP_COMMON.imaging, 'Wear loose, comfortable clothing you can move in easily (loose pants, shorts and a shirt are best).', PREP_COMMON.meal, PREP_COMMON.time, PREP_COMMON.after],
    expect: [
      'Before your first session you fill out a detailed intake form. Your first visit then starts with a thorough evaluation of your main complaint: a review of your medical history and a physical examination. Your practitioner asks how the injury happened, what symptoms you have, and how you would rate the pain from 1 to 10. Osteopathy treats the whole body and looks for the root cause, so you may also be asked about past injuries, diet, lifestyle and daily life.',
      'During the examination your practitioner palpates (feels) areas of your body, listening to the muscles, bones, joints and connective tissue for congestion, scarring, dehydration, swelling, and changes in temperature and tone. Sometimes it can feel as if they are barely touching you. They may also ask you to move different parts of your body while they feel for restrictions.',
      'Based on the assessment, your practitioner builds a treatment plan that may combine soft tissue mobilization, stretching, joint mobilization, manipulation and cupping therapy, along with heat or cold therapy, electrical stimulation and ultrasound to manage pain and promote healing.',
      'Treatment usually involves your active participation: you may be asked to gently engage muscles, move joints through different motions, or change position from seated to lying down or on your side.',
      NOT_MEDICINE('Manual Osteopathic Practitioners')
    ],
    after: [
      'Many people feel good after a treatment and notice some relief from pain.',
      'Manual osteopathy is not usually painful, but it is normal to feel sore, stiff or tired for the first few days. This depends on the areas treated, the mobilizations used, and your own inflammation, hormonal cycle and emotional state.',
      'If cupping was part of your treatment, the circular marks usually fade within 5–10 days. Mild itchiness is normal. Keep the area covered, dry and warm, and avoid wind, cold and damp.',
      'After cranial osteopathy, some people feel a little light-headed.',
      'Healing is not linear. Rest after treatment; a light stretch, a warm bath or a walk is ideal, and avoid hard exercise so your body can absorb the benefits.'
    ]
  },
  physiotherapy: {
    title: 'Physiotherapy in Thornhill',
    metaTitle: 'Physiotherapy in Thornhill | OSTEO+',
    desc: 'Physiotherapy at OSTEO+ Thornhill for injuries, post-surgical recovery, chronic pain and sports injuries. Initial assessment $150, follow-ups from $100. Book online.',
    q: 'What is physiotherapy?',
    what: [
      'Physiotherapy is a hands-on, evidence-based treatment approach focused on restoring movement, reducing pain and improving overall function. It addresses injuries, post-surgical recovery, chronic pain, sports-related conditions and movement problems.',
      'Through a combination of manual therapy, targeted exercise, education and rehabilitation planning, physiotherapy supports recovery, helps prevent re-injury and optimizes physical performance.'
    ],
    helps: ['Injuries', 'Post-surgical recovery', 'Chronic pain', 'Sports-related conditions', 'Movement dysfunction'],
    prep: [PREP_COMMON.intake.replace(' and create an online profile', ''), 'Wear comfortable clothing that allows movement and access to the area being treated.', PREP_COMMON.time, 'Stay hydrated before and after your appointment.'],
    expect: [
      'Your first visit includes a comprehensive assessment of your concerns, injury history, movement patterns and goals. Based on this, your physiotherapist creates a personalized treatment plan.',
      'Treatment may include manual therapy and joint mobilization, soft tissue techniques, corrective exercises and rehabilitation programs, postural and movement education, and modalities such as heat or cold therapy, ultrasound and IFC.',
      'Sessions are interactive, and you may be given exercises or strategies to continue at home to support your recovery.'
    ],
    after: [
      'You may feel relief right away, or improve gradually over several sessions depending on your condition. Mild soreness can happen, especially when you start a new rehab program.',
      'For best results, follow your home exercises, stay hydrated, and keep moving lightly unless advised otherwise.',
      'If symptoms get worse or you have concerns, contact your practitioner.'
    ]
  },
  'athletic-therapy': {
    title: 'Athletic Therapy in Thornhill',
    metaTitle: 'Athletic Therapy in Thornhill | Sports Injury Rehab | OSTEO+',
    desc: 'Certified Athletic Therapy at OSTEO+ Thornhill: injury assessment, rehab, posture correction and taping for athletes of all ages. From $90. Book online.',
    q: 'What is athletic therapy?',
    what: [
      'Athletic Therapy (AT) is a healthcare profession that blends the latest evidence-based research with hands-on clinical experience. Certified Athletic Therapists are highly trained in injury prevention, assessment, management and treatment of injuries related to physical activity, sports and posture.',
      'Athletic Therapists work with people of all ages and abilities to recover from injuries, prevent future ones, and improve athletic performance and work. At OSTEO+, our Athletic Therapist specializes in the prevention, assessment and management of musculoskeletal injuries, postural imbalances, posture correction, and corrective and supportive taping.'
    ],
    helps: ['Sports injuries', 'Musculoskeletal injuries', 'Postural imbalances', 'Posture correction', 'Corrective and supportive taping', 'Return-to-sport rehab'],
    prep: [PREP_COMMON.intake, PREP_COMMON.imaging, 'Wear loose, comfortable clothing you can move in easily. Some people bring a gym bag with workout clothes and a water bottle.', PREP_COMMON.meal, PREP_COMMON.time, PREP_COMMON.after],
    steps: [
      ['Assessment', 'A thorough evaluation of your injury, including your medical history and a physical exam. Your therapist asks how the injury happened and what symptoms you have.'],
      ['Clinical impression', 'Based on the assessment, your therapist develops a treatment plan.'],
      ['Treatment', 'Manual therapy, soft tissue mobilization, stretching and strengthening exercises, plus heat or cold therapy, electrical stimulation and ultrasound to manage pain and promote healing.'],
      ['Rehabilitation', 'A program to help you regain strength and flexibility: exercises for range of motion, reducing swelling and pain, and preventing re-injury.'],
      ['Education', 'How to manage your injury and prevent it from coming back: activities to avoid, recommended exercises, pain management and an expected recovery timeline.'],
      ['Follow-up', 'Follow-up appointments to monitor your progress and adjust your plan.']
    ],
    expect: [
      NOT_MEDICINE('Athletic Therapists'),
      'The goal of athletic therapy is to help you recover from injury, manage pain and improve your physical function so you can safely return to your sport or activity as soon as possible.'
    ],
    after: [
      'You may feel tenderness in some muscles or joints, though not everyone does.',
      'If pain-relieving modalities were used you may feel relief right after treatment, then more pain several hours later. This is expected and completely normal.',
      'You may feel more discomfort in the days after treatment. Healing is non-linear and sometimes things get worse before they get better.',
      'If pain persists for several days, gets worse, spreads or changes, let your therapist know.'
    ]
  },
  'massage-therapy': {
    title: 'Registered Massage Therapy in Thornhill',
    metaTitle: 'Registered Massage Therapy (RMT) in Thornhill | OSTEO+',
    desc: 'RMT massage at OSTEO+ Thornhill: therapeutic, deep tissue, relaxation and pre/post-natal massage. 30–90 min from $90, with RMT receipts. Book online.',
    q: 'What is Registered Massage Therapy (RMT)?',
    what: [
      'Registered Massage Therapy is the use of therapeutic touch and manual techniques by a Registered Massage Therapist (RMT) to relieve pain, relax muscles and improve physical function. Soft tissue work falls into three categories: soft tissue mobilization or manipulation, acupressure, and stretching techniques.',
      'Massage therapy is the manual manipulation of soft tissue to produce effects on the nervous, muscular, fascial, lymphatic and circulatory systems.'
    ],
    helps: ['Muscle tension and pain', 'Stress and relaxation', 'Deep tissue work', 'Pre- and post-natal massage', 'Recovery from injury'],
    prep: [PREP_COMMON.intake, PREP_COMMON.imaging, 'Wear or bring loose, comfortable clothing to change into after treatment.', PREP_COMMON.meal, PREP_COMMON.time, PREP_COMMON.after],
    expect: [
      'Before your first session you fill out a detailed intake form. Your therapist then asks about any health issues, your goals for the session, and your preferred pressure and techniques.',
      'You are given a private room where you undress to your level of comfort and lie on a massage table under a sheet or blanket. Your therapist knocks before coming back in.',
      'Your therapist may use oil or lotion and techniques such as kneading, gliding, rolling, myofascial release, trigger point release and cupping, depending on the type of treatment you choose.',
      'At the end, your therapist leaves the room so you can dress in private, then returns to discuss aftercare and recommendations for future sessions.',
      NOT_MEDICINE('Registered Massage Therapists')
    ],
    after: [
      'Most people feel relaxed after a massage. In the days that follow, sleep, digestion and energy may improve, and pain and stress are reduced.',
      'You may feel tenderness in some muscles or joints, though not everyone does.',
      'If cupping was part of your treatment, the marks usually fade within 5–10 days. Mild itchiness is normal; keep the area covered, dry and warm.',
      'Feeling tired afterwards is common; it is a sign your body is processing the treatment, so let yourself rest.'
    ]
  },
  'therapeutic-sports-massage': {
    title: 'Therapeutic Sports Massage in Thornhill',
    metaTitle: 'Therapeutic Sports Massage in Thornhill | OSTEO+',
    desc: 'Therapeutic sports massage at OSTEO+ Thornhill: deep tissue, myofascial release, trigger point, cupping and IASTM for tight, sore muscles. From $90. Book online.',
    q: 'What is therapeutic sports massage?',
    what: [
      'Therapeutic sports massage uses deep pressure and specific techniques to address muscle and joint issues. Although it is often associated with athletes, it is very effective for anyone with muscle tension, stress or discomfort from everyday activities.',
      'It targets specific muscle groups that are tense or painful, even if you are not involved in sports, and helps with back pain, shoulder tension and neck stiffness. Your therapist adjusts techniques to your needs, whether your tension comes from sitting at a desk, repetitive tasks or general soreness.'
    ],
    helps: ['Back pain', 'Shoulder tension', 'Neck stiffness', 'Desk-work tension', 'Repetitive strain', 'General muscle soreness'],
    techniques: [
      ['Deep tissue massage', 'Focuses on deeper muscle layers to relieve chronic tension.'],
      ['Myofascial release', 'Targets the connective tissues to improve flexibility and reduce tightness.'],
      ['Trigger point therapy', 'Applies pressure to specific areas to ease muscle pain and discomfort.'],
      ['Cupping and IASTT', 'Cupping therapy and instrument-assisted soft tissue therapy, also known as muscle scraping.']
    ],
    benefits: ['Relieves muscle tension', 'Improves flexibility and range of motion', 'Reduces stress'],
    expect: [
      'No sheets are used. Unlike traditional massage, therapeutic sports massage is done without draping, so please wear shorts and a tank top. This lets your therapist reach the muscles without adjusting or removing clothing.',
      'Your therapist starts by discussing your specific issues and areas of concern, then tailors the massage techniques to your needs.'
    ]
  },
  'fascial-stretch-therapy': {
    title: 'Fascial Stretch Therapy (FST) in Thornhill',
    metaTitle: 'Fascial Stretch Therapy (FST) in Thornhill | OSTEO+',
    desc: 'Fascial Stretch Therapy at OSTEO+ Thornhill: assisted stretching that targets the fascia to improve flexibility, posture and pain. 30–75 min from $80. Book online.',
    q: 'What is Fascial Stretch Therapy (FST)?',
    what: [
      'Fascial Stretch Therapy (FST) is a type of manual therapy designed to improve flexibility, reduce pain and enhance physical function by targeting the fascia, the connective tissue that surrounds and supports muscles, bones and joints throughout the body. It uses gentle assisted stretching and is suitable for anyone.'
    ],
    fascia: [
      ['What fascia is', 'A web-like network of connective tissue throughout the body. It connects and supports muscles, organs and other structures and helps keep them aligned and working.'],
      ['Types of fascia', 'Superficial fascia (just beneath the skin), deep fascia (surrounding muscles and bones) and visceral fascia (surrounding organs).']
    ],
    steps: [
      ['Assessment', 'Your therapist checks your range of motion, posture and any areas of tightness or discomfort to see which areas need attention.'],
      ['Manual stretching', 'A combination of passive stretching and joint mobilization, with gentle sustained pressure, done lying down or seated to target different areas.'],
      ['Active movement', 'You may be asked to engage your muscles while your therapist performs the stretch, which makes it more effective.'],
      ['Fascial release', 'Releasing restrictions in the fascia to improve blood flow, reduce pain and restore movement.']
    ],
    benefits: ['Improved flexibility and range of motion', 'Reduced pain and discomfort', 'Better athletic performance and recovery', 'Better posture and alignment', 'Increased mobility for daily activities'],
    who: [['Athletes', 'To enhance performance and prevent injuries.'], ['Office workers', 'To relieve tension and improve posture.'], ['People with chronic pain', 'To help manage and reduce discomfort.'], ['Anyone wanting more flexibility', 'To move better day to day.']]
  },
  tmj: {
    title: 'TMJ Treatment in Thornhill',
    metaTitle: 'TMJ & Jaw Pain Treatment in Thornhill | OSTEO+',
    desc: 'TMJ treatment at OSTEO+ Thornhill for jaw pain, clicking, locking and headaches, using massage therapy and acupuncture. Sessions from $90. Book online.',
    q: 'What is TMJ dysfunction?',
    what: [
      'Temporomandibular joint (TMJ) dysfunction is a condition affecting the jaw joint and the muscles around it. It can cause pain, discomfort and difficulty moving the jaw, which affects everyday things like chewing and speaking.',
      'At OSTEO+ we offer holistic approaches to manage and relieve TMJ dysfunction. Our RMTs and acupuncturist use techniques that target the root cause of your discomfort to relieve pain and improve range of motion and jaw function.'
    ],
    symptoms: ['Difficulty chewing', 'Clicking or popping sounds in the jaw', 'Locking of the jaw joint', 'Headaches or earaches', 'Facial pain or fatigue'],
    approaches: [
      ['Massage therapy (RMT)', [
        ['Myofascial release', 'Gentle pressure to release tension in the jaw muscles and surrounding fascia.'],
        ['Trigger point therapy', 'Targeted pressure on specific points to ease pain and restore muscle function.'],
        ['Craniosacral therapy', 'Gentle techniques to restore the natural rhythm of the craniosacral system, promoting relaxation and pain relief.']
      ]],
      ['Acupuncture', [
        ['Reduce muscle tension', 'Acupuncture points related to jaw function are used to release tension in the muscles involved in TMJ dysfunction.'],
        ['Improve circulation', 'Better blood flow promotes healing and reduces inflammation in the area.'],
        ['Restore balance', 'Acupuncture aims to rebalance the body’s energy flow (Qi), addressing imbalances that may contribute to TMJ dysfunction.']
      ]]
    ]
  },
  acupuncture: {
    title: 'Acupuncture in Thornhill',
    metaTitle: 'Acupuncture in Thornhill | Registered Acupuncturists | OSTEO+',
    desc: 'Acupuncture at OSTEO+ Thornhill for pain, stress, migraines, anxiety, fertility and pregnancy support. 30–60 min from $80, no HST. Book online.',
    q: 'What is acupuncture?',
    what: [
      'Acupuncture involves inserting very thin needles through your skin at strategic points on your body, known as acupuncture points. Practitioners view these points as places to stimulate nerves, muscles and connective tissue.',
      'Acupuncture is most commonly used to treat pain by boosting your body’s natural painkillers. It is increasingly used for overall wellness, stress management, migraines, menstrual cramps, tennis elbow, PTSD and a variety of other conditions.'
    ],
    helps: ['Pain', 'Stress', 'Migraines', 'Menstrual cramps', 'Tennis elbow', 'Anxiety and low mood', 'Sleep', 'Digestion', 'Fertility and pregnancy support'],
    prep: [PREP_COMMON.intake, 'Wear loose, comfortable clothing. Depending on the area treated, you may be asked to remove an article of clothing; a gown or linens are provided.', PREP_COMMON.meal, PREP_COMMON.time, 'Rest after treatment and avoid strenuous activity so your body gets the full benefit.', 'Stay hydrated before and after treatment; it can help recovery.'],
    expect: [
      'Before your first session you fill out a detailed intake form, followed by an in-person initial assessment of your main reason for seeking treatment. This lets your acupuncturist build a treatment plan around their findings.',
      'The needles are very thin, so insertion typically causes no discomfort. Depending on your condition, the session may also include heat or cold packs, gentle massage, bolsters to support your body, or an acupressure mat.',
      'In most cases the needles stay in for 10–15 minutes while you rest in stillness and comfort, listening to a guided meditation, gentle music or silence, your choice. There is typically no discomfort when the needles are removed.',
      NOT_MEDICINE('Acupuncture Practitioners')
    ],
    after: [
      'Most people feel relaxed after acupuncture. In the following days, sleep, digestion and energy may improve, and pain and stress may decrease.',
      'Some people feel tired; it is a sign your body is healing, so allow yourself to rest.',
      'Some people notice their symptoms intensify within 48 hours, especially with a new injury. This is a normal reaction on the way to healing. If things do not improve within 48 hours, let your therapist know.',
      PREP_COMMON.after
    ]
  },
  'cupping-therapy': {
    title: 'Cupping Therapy in Thornhill',
    metaTitle: 'Cupping Therapy in Thornhill | OSTEO+',
    desc: 'Cupping therapy at OSTEO+ Thornhill, offered within osteopathy, massage and acupuncture sessions to relieve muscle tension and boost circulation. Book online.',
    q: 'What is cupping therapy?',
    what: [
      'Cupping is a type of alternative therapy that involves placing cups on the skin to create suction. Cupping increases blood circulation to the area where the cups are placed.',
      'This may relieve muscle tension, which can improve overall blood flow and promote cell repair. It may also help form new connective tissue and create new blood vessels in the tissue.'
    ],
    note: 'At OSTEO+, cupping is used as part of osteopathy, registered massage therapy, therapeutic sports massage and acupuncture sessions. Book one of those treatments and mention you would like cupping.',
    after: ['The circular marks usually fade within 5–10 days. Mild itchiness over the marks is normal.', 'Keep the treated area covered, dry and warm, and avoid wind, cold and damp.']
  },
  naturopathy: {
    title: 'Naturopathy in Thornhill',
    metaTitle: 'Naturopathic Doctor in Thornhill | Naturopathy | OSTEO+',
    desc: 'A Naturopathic Doctor at OSTEO+ Thornhill for stress, sleep, chronic pain, hormones, digestion, fertility and paediatrics. In person or virtual. Book online.',
    q: 'What is naturopathy?',
    what: [
      'Naturopathic medicine is a holistic approach to healthcare that emphasizes the body’s inherent ability to heal itself. Naturopathic Doctors are trained as primary care providers, diagnosing and treating patients with a blend of evidence-based medicine and traditional natural therapies.',
      'It focuses on disease prevention, patient education and minimally invasive treatment, integrating nutrition, lifestyle counselling, supplements, herbal medicine, acupuncture and cupping to address the root causes of illness and promote optimal health.'
    ],
    helps: ['Paediatrics', 'Better sleep', 'Chronic pain', 'Stress', 'Diet and nutrition', 'Anxiety and burnout', 'Hormonal concerns', 'Digestive health', 'Fertility'],
    note: 'Dr. Angelica offers a free 15-minute phone consultation and both in-person and virtual visits through our online booking page.'
  },
  'lymphatic-drainage-massage': {
    title: 'Brazilian Lymphatic Drainage Massage in Thornhill',
    metaTitle: 'Brazilian Lymphatic Drainage Massage in Thornhill | OSTEO+',
    desc: 'Brazilian lymphatic drainage and buccal facial massage at OSTEO+ Thornhill to reduce swelling, bloating and fluid retention. From $165. Book online.',
    q: 'What is a Brazilian lymphatic drainage massage?',
    what: [
      'A Brazilian lymphatic drainage massage is a therapeutic technique that stimulates the lymphatic system to help remove toxins, excess fluid and waste products from the body. It uses gentle, rhythmic strokes and light pressure on specific areas to improve lymphatic circulation.',
      'People seek it out for reduced swelling, a smoother look to cellulite, digestion support and overall detox, and for a smoother, firmer skin texture, all while accentuating the body’s natural curves.'
    ],
    helps: ['Swelling and fluid retention', 'Bloating and digestion', 'Post-surgical recovery', 'Facial puffiness (buccal facial massage)', 'Relaxation'],
    note: 'Our lymphatic therapists also offer buccal (intraoral) facial massage. Read more in our blog post on lymphatic drainage and buccal facial massage.'
  },
  'kinesiology-taping': {
    title: 'Kinesiology Taping in Thornhill',
    metaTitle: 'Kinesiology Taping in Thornhill | OSTEO+',
    desc: 'Kinesiology taping at OSTEO+ Thornhill to support joints, muscles and tendons, correct posture and protect injuries. Applied during athletic therapy. Book online.',
    q: 'What is kinesiology taping?',
    what: [
      'Kinesiology taping involves placing strips of special tape on your body in specific directions to improve mobility and support your joints, muscles and tendons.',
      'It is commonly used to correct posture and to limit range of motion in joints to prevent further harm or injury.'
    ],
    note: 'Corrective and supportive taping is part of athletic therapy at OSTEO+. Book an athletic therapy session and your therapist will tape as needed.'
  }
};

/* "What brings you in?" matcher on the home page. Each concern maps to services and practitioners
   using only what their own bios and the clinic's pages say they treat. */
const CONCERNS = [
  { id: 'back-neck', label: 'Back or neck pain', services: ['osteopathy', 'physiotherapy', 'massage-therapy'], team: ['justin-marco', 'anna-guimadeev', 'steve-shelmov', 'marco-de-palma'], why: 'Osteopathy and physiotherapy both treat back and neck pain hands-on; massage eases the muscle tension around it.' },
  { id: 'sports', label: 'Sports injury', services: ['athletic-therapy', 'physiotherapy', 'therapeutic-sports-massage', 'kinesiology-taping'], team: ['shirel-bronizer', 'steve-shelmov', 'marco-de-palma', 'sammy'], why: 'Assessment, rehab and taping to get you back to your sport, plus deep work on tight muscles.' },
  { id: 'chronic', label: 'Chronic pain', services: ['osteopathy', 'acupuncture', 'naturopathy'], team: ['justin-marco', 'anna-guimadeev', 'dr-angelica-dimita'], why: 'Chronic pain is what OSTEO+ specializes in, with whole-body osteopathy at the centre.' },
  { id: 'jaw', label: 'Jaw pain or clenching (TMJ)', services: ['tmj', 'acupuncture', 'massage-therapy', 'lymphatic-drainage-massage'], labels: { 'lymphatic-drainage-massage': 'Buccal facial massage' }, team: ['sammy', 'erik-pasquino', 'andrea-pellegrino'], why: 'Massage techniques and acupuncture aimed at the jaw muscles and the root cause of the tension, plus buccal (intraoral) facial massage with Andrea.' },
  { id: 'headaches', label: 'Headaches & migraines', services: ['osteopathy', 'acupuncture', 'tmj'], team: ['justin-marco', 'erik-pasquino'], why: 'Osteopathy is used for headaches and migraines, and acupuncture is commonly used for migraines.' },
  { id: 'stiff', label: 'Stiffness & flexibility', services: ['fascial-stretch-therapy', 'therapeutic-sports-massage'], team: ['sammy', 'shirel-bronizer'], why: 'Assisted stretching that targets the fascia, and deep work on tight muscle groups.' },
  { id: 'stress', label: 'Stress, anxiety & sleep', services: ['acupuncture', 'naturopathy', 'massage-therapy'], team: ['erik-pasquino', 'dr-angelica-dimita', 'andrea-pellegrino'], why: 'Calming treatments and a natural, whole-person plan for stress, mood and sleep.' },
  { id: 'pregnancy', label: 'Pregnancy & postpartum', services: ['acupuncture', 'massage-therapy'], team: ['fanda-wong', 'andrea-pellegrino', 'anna-guimadeev'], why: 'Perinatal acupuncture and pre/post-natal massage for comfort before, during and after pregnancy.' },
  { id: 'fertility', label: 'Fertility & hormones', services: ['acupuncture', 'naturopathy'], team: ['fanda-wong', 'dr-angelica-dimita'], why: 'Women’s health and fertility acupuncture, and naturopathic care for hormonal concerns.' },
  { id: 'swelling', label: 'Swelling, bloating & post-surgery', services: ['lymphatic-drainage-massage', 'physiotherapy'], team: ['andrea-pellegrino', 'marco-de-palma'], why: 'Gentle lymphatic drainage to move excess fluid, and physiotherapy rehab to rebuild strength and confidence after surgery.' },
  { id: 'digestion', label: 'Digestion', services: ['naturopathy', 'acupuncture', 'lymphatic-drainage-massage'], team: ['dr-angelica-dimita', 'erik-pasquino', 'andrea-pellegrino'], why: 'Naturopathic care, digestive acupuncture and lymphatic massage all support digestion.' }
];

/* Team bios (from each practitioner's page on osteo-plus.ca). */
const BIOS = {
  'justin-marco': {
    short: 'Osteopath',
    old: 'justinmarco',
    creds: ['DOMP, National Academy of Osteopathy', 'Specialized Honours BSc, Kinesiology & Health Science, York University (2017)', 'CEO & Clinic Director'],
    bio: [
      'Justin Marco was born and raised in Thornhill, Ontario, and practises as an Osteopath. He is also CEO and clinic director at OSTEO+. In 2017 he graduated from York University with a specialized honours degree in Kinesiology and Health Science, then continued his education at the National Academy of Osteopathy, where he earned his DOMP (Diploma of Osteopathic Manual Practice).',
      'Justin played highly competitive hockey growing up, winning an Ontario championship, a GTHL championship and a gold medal at the 2013 Maccabiah Games, and earned a hockey scholarship to an NCAA school in the United States. His dream was to play professionally, but injuries got in the way. He spent a lot of time being treated by all kinds of therapists, which led him to osteopathy.',
      'Having seen what those practitioners did for him, from acute pain to longer-term chronic pain, he chose osteopathy over other health professions for its full-body approach and how effective it is for chronic pain. In his free time he coaches minor hockey, helping young athletes grow as players and people, and enjoys gaming, watching sports, staying active and time with friends and family.'
    ]
  },
  'anna-guimadeev': {
    short: 'Osteopath & RMT',
    old: 'annaguimadeev',
    creds: ['DOMP, National Academy of Osteopathy', 'Diploma in Massage Therapy, Elmcrest College', 'Member, College of Massage Therapists of Ontario (CMTO)', 'Member, Canadian Alliance of Alternative Medicine', 'Modo Yoga International Teacher Training'],
    bio: [
      'Anna became a Registered Massage Therapist in 2012 in Toronto. Her deep interest in anatomy led her to train as a yoga teacher with Modo Yoga in Los Angeles the following year. The two practices complemented each other in bringing harmony and relief to the body, but neither alone brought long-term relief to patients with chronic dysfunction. Osteopathy was the missing link.',
      'Where massage ends at soft tissue, osteopathy goes deeper into joints, muscles and bones, aiming to positively affect the nervous, circulatory and lymphatic systems and restore mobility. Anna ties all three practices together in treatments designed to help the body work at its best.',
      'Anna is the co-founder and clinic director of OSTEO+. She specializes in cupping therapy and myofascial release, and is learning Spanish on Duolingo with an 845-day streak.'
    ]
  },
  'fanda-wong': {
    short: 'Acupuncturist',
    old: 'fandawong',
    creds: ['Registered Acupuncturist (R.Ac.) & TCM Practitioner', 'Traditional Chinese Medicine Practitioner program, Humber College (honours)', 'BSc Life Science (Health and Disease), University of Toronto', 'Chinese Medicine internship, Hong Kong Baptist University'],
    languages: 'English and Cantonese',
    bio: [
      'Fanda is a licensed Traditional Chinese Medicine Practitioner (TCMP) and acupuncturist in Toronto. Her interest in Chinese medicine grew after she graduated from the Life Science program at the University of Toronto, majoring in Health and Disease, where she realized that prevention is key. She went on to the Traditional Chinese Medicine Practitioner program at Humber College and graduated with honours.',
      'At Humber she received the Chinese Medicine program scholarship two years in a row and was chosen for a Chinese medicine internship at Hong Kong Baptist University. That experience deepened her passion for acupuncture and herbal medicine, especially women’s health. Alongside gynecology and reproductive health, she has treated acute and chronic pain, insomnia, emotional distress, digestive issues and chronic illness, often combining acupuncture, herbal medicine and cupping.',
      'Fanda speaks fluent English and Cantonese. Outside the clinic she loves spending time with her family and her two puppies.'
    ]
  },
  'erik-pasquino': {
    short: 'Acupuncturist (TCM)',
    old: 'erikpasquino',
    creds: ['6-year advanced diploma in TCM, 8 Branches Academy', '2-month internship in China', 'BA, Religious Studies, York University'],
    bio: [
      'Erik started his Traditional Chinese Medicine (TCM) journey after multiple skiing injuries, amazed by how well it worked. He found it helped not only his sports injuries and pain, but also his sleep, digestion, stress and emotions. He holds a 6-year advanced diploma from 8 Branches Academy, completed a 2-month internship in China, and has a Bachelor of Arts in Religious Studies from York University.',
      'Erik takes a hands-on approach with acupuncture and Tui Na (therapeutic massage). Treatments may include cupping, and a heat lamp is often used for comfort and its therapeutic benefits. He can also make lifestyle and dietary recommendations based on TCM principles.',
      'TCM treats body and mind as a whole, so your first treatment includes a full body-system review and health history, including your tongue and pulse. Together you build a plan to improve your health. Erik moved back from British Columbia to be closer to friends and family; outside the clinic you will find him gardening, hiking, on his motorcycle or supporting Liverpool F.C.'
    ]
  },
  'dr-angelica-dimita': {
    short: 'Naturopathic Doctor',
    old: 'angelica',
    creds: ['Doctor of Naturopathy, Canadian College of Naturopathic Medicine', 'Honours BSc, McMaster University', 'Member, CAND, OAND and College of Naturopaths of Ontario (CONO)'],
    focus: ['Paediatrics', 'Better sleep', 'Chronic pain', 'Stress & burnout', 'Diet & nutrition', 'Anxiety', 'Hormonal concerns', 'Eczema', 'Digestive complaints', 'ADHD'],
    bio: [
      'Dr. Angelica is a Naturopathic Doctor with a passion for helping people become the best version of themselves. Using a holistic approach, she blends evidence-informed medicine with the healing power of nature to create treatment plans unique to each patient, integrating nutrition, lifestyle counselling, supplements, herbal medicine and acupuncture.',
      'After an Honours Bachelor of Science at McMaster University, she earned her Doctor of Naturopathy from the Canadian College of Naturopathic Medicine. She treats kids and adults for a wide range of concerns, including anxiety, stress and burnout, hormonal concerns, eczema, digestive complaints, ADHD and chronic pain, and loves meeting every member of the family.',
      'Dr. Angelica is an active member of the Canadian Association of Naturopathic Doctors (CAND), the Ontario Association of Naturopathic Doctors (OAND) and the College of Naturopaths of Ontario (CONO).'
    ]
  },

  'andrea-pellegrino': {
    short: 'Registered Massage Therapist',
    old: 'andrea',
    creds: ['Registered Massage Therapist (RMT)', 'Graduate, Sutherland-Chan School', 'Trained in Buccal (intraoral) facial massage'],
    bio: [
      'Andrea Pellegrino, RMT, offers a calming, restorative approach to massage therapy with a focus on Brazilian Lymphatic Drainage and relaxation treatments. A graduate of Sutherland-Chan, she combines advanced technique with a soothing touch to support both wellness and aesthetic balance.',
      'Her lymphatic drainage work promotes detoxification, digestive health, immune function and the management of edema related to various conditions. Clients leave feeling lighter, balanced and renewed.',
      'As the clinic’s relaxation massage specialist, Andrea is the person to see when you need to unwind. She is also trained in Buccal (intraoral) facial massage, a sculpting, rejuvenating complement to her lymphatic work.'
    ]
  },

  sammy: {
    short: 'Massage & Fascial Stretch Therapist',
    old: 'sammy',
    creds: ['Diploma in Massage Therapy, Royal Canadian College of Massage Therapy', 'Honours BSc, Biology (minors in Mathematics and Psychology), University of Toronto', 'Fascial Stretch Therapy', 'Training from Functional Range Systems, Postural Restoration Institute and Oxygen Advantage'],
    bio: [
      'Sammy graduated with an Honours Bachelor of Science in Biology, with minors in Mathematics and Psychology, from the University of Toronto, and a Diploma in Massage Therapy from the Royal Canadian College of Massage Therapy. He started his career as a personal trainer at GoodLife Fitness, where his fascination with rehabilitation led him to Fascial Stretch Therapy.',
      'He has since added teachings from Functional Range Systems, the Postural Restoration Institute and Oxygen Advantage. Sammy works in clinic and gym settings with people from all walks of life, specializing in joint longevity, postural integration and breathing dysfunction.'
    ]
  },
  'steve-shelmov': {
    short: 'Physiotherapist',
    old: 'steve',
    creds: ['MSc Physical Therapy, Queen’s University', 'BSc Kinesiology & Health Science, York University'],
    bio: [
      'Steve has had a wide range of injuries over the years, from organized sports, weight training and long hours at a desk. Those experiences introduced him to physiotherapy for both recovery and injury prevention, and sparked his interest in it as a career.',
      'Steve earned his Master of Science in Physical Therapy from Queen’s University and holds a Bachelor of Kinesiology & Health Science from York University.',
      'He has extensive experience with athletes of all ages and backgrounds, keeps up with current research, and takes an evidence-based approach. His treatment combines functional movement patterns, manual therapy and individualized exercise programs to help patients return to activity, reduce pain and reach their health and fitness goals.'
    ]
  },  'marco-de-palma': {
    short: 'Physiotherapist',
    creds: ['Registered Physiotherapist, College of Physiotherapists of Ontario', 'Master’s in Physical Therapy, Queen’s University (2018)', 'Kinesiology (major) and Biology (minor), York University (2014)'],
    focus: ['Post-surgical rehab', 'Sports injuries', 'Dizziness & balance (vestibular)'],
    bio: [
      'Marco is a registered physiotherapist in Ontario, licensed by the College of Physiotherapists of Ontario. His path into the profession started on the other side of the treatment table: he injured both knees and needed ACL reconstruction surgeries. The physiotherapy that got him back on his feet shaped his career.',
      'That experience is why Marco puts the relationship first. Rehab is as much mental as physical, and confidence and trust in your body come back alongside strength. He takes time to listen to each patient, understand what matters to them, and build the plan together, because the plan that works is the one you’ll follow.',
      'He most enjoys treating post-surgical patients, sports injuries, and vestibular conditions such as dizziness and balance problems. His treatment pairs hands-on soft tissue work and joint mobilizations with exercise programs built around how each patient moves.',
      'Marco graduated from York University in 2014 with a major in Kinesiology and a minor in Biology, then completed his Master’s in Physical Therapy at Queen’s University in 2018. Outside the clinic he stays as active as possible, tests new recipes, and above all makes pizza in his outdoor oven.'
    ]
  },

  'shirel-bronizer': {
    short: 'Athletic Therapist',
    old: 'shirelbronizer',
    creds: ['Certified Athletic Therapist', 'Specialized Honours Bachelor of Kinesiology', 'Certificate in Athletic Therapy', 'Miss Dance Canada 2016', 'Gold medal, Team Canada, Commonwealth Dance Championships 2018'],
    bio: [
      'Shirel is a Certified Athletic Therapist with a background as a professional and competitive dancer. With 23 years of dance experience, including teaching competitive dance, being crowned Miss Dance Canada in 2016 and winning gold with Team Canada at the 2018 Commonwealth Dance Championships in South Africa, she understands the physical demands dancers and athletes face.',
      'Holding a specialized Honours Bachelor of Kinesiology and a certificate in Athletic Therapy, she offers sport-specific injury assessments, tailored rehab programs, performance enhancement strategies, and conditioning and wellness guidance.',
      'Shirel has clinic and on-field experience with athletes in football, dance, wrestling, soccer, basketball, volleyball, hockey and more. As an athlete with her own history of injuries, she knows what people need when they come in with a sport-specific injury, and she is dedicated to getting them back to 100%.'
    ]
  }
};

const ABOUT = [
  'At OSTEO+, we are committed to providing compassionate and effective therapy to help our clients overcome life’s challenges and reach their goals. Our team of highly skilled and motivated practitioners helps individuals, couples and families through difficult times toward hope, healing and growth.',
  'We are dedicated to personalized, effective osteopathic care that helps clients achieve optimal health and wellness. Together, we deliver the highest standard of care to every client who joins the OSTEO+ family, helping them unlock their body’s full potential.'
];

const TESTIMONIAL = {
  name: 'Danielle',
  photo: 'clinic/danielle-client',
  text: '5 stars is an understatement. What an amazing team, comfortable space, and incredible service. I have never done Osteopathy before but it was seriously life changing. Justin was amazing and informed me of everything he was doing throughout the session. He is very knowledgeable and is amazing at what he does. I am already booking my next visit. This place is a must!! 11/10'
};

// General FAQs from osteo-plus.ca/faqs, plus visit questions answered from the clinic's own pages.
const FAQS = [
  ['What is osteopathy?', 'Osteopathy is a manual therapy that aims to improve health by restoring the body’s structural balance and increasing its ability to heal itself. It uses gentle manual techniques to assess and treat a wide range of conditions, including musculoskeletal pain, joint problems and headaches.'],
  ['Who can benefit from osteopathic treatment?', 'Osteopathic treatment can help people of all ages and backgrounds. It is suitable for acute and chronic conditions, and for people looking to improve their overall health and wellness.'],
  ['What conditions can osteopathy treat?', 'Osteopathy can treat a wide range of conditions, including back and neck pain, joint problems, headaches, sports injuries and postural imbalances. It can also help with digestive and respiratory issues, and with problems related to pregnancy and childbirth.'],
  ['What should I expect during an osteopathic treatment?', 'At your first appointment, your osteopath carries out a thorough examination and asks about your symptoms, lifestyle and medical history. From that they build a personalized treatment plan, which may include manual techniques such as stretching, massage and joint mobilization.'],
  ['Is osteopathic treatment safe?', 'Yes, osteopathic treatment is safe when performed by a qualified, registered practitioner. Your osteopath takes your individual needs and health into account and adjusts the intensity of treatment accordingly.'],
  ['How many sessions will I need?', 'It depends on your circumstances and how severe your condition is. Your osteopath can give you a more accurate estimate after your first appointment.'],
  ['Can I have osteopathic treatment with a pre-existing medical condition?', 'Yes. Tell your osteopath about any medical conditions you have, as they may need to adjust their approach.'],
  ['Is osteopathic treatment covered by insurance?', 'Coverage varies by provider, so check your plan for details, although most insurance companies cover osteopathic treatment.'],
  ['Where is OSTEO+ and when are you open?', 'OSTEO+ is at 10 Disera Dr, Unit 200, Thornhill, ON L4J 0A7, on the second floor. We are open Monday to Thursday 10 am – 8 pm, Friday 10 am – 2 pm and Saturday 9 am – 2 pm.'],
  ['How do I book an appointment?', 'Book online any time through our Jane booking page, where you can choose a practitioner, treatment and time. You can also call (289) 588-3124 or email info@osteo-plus.ca.'],
  ['Do you offer a free consultation?', 'Yes. A free 15-minute initial consultation is available for osteopathy, acupuncture and athletic therapy, and our Naturopathic Doctor offers a free 15-minute phone consultation. Choose “Initial Consultation” when you book online.'],
  ['How should I prepare for my first visit?', 'Fill out the online intake form and create your profile before you arrive, bring or upload any X-ray, ultrasound or MRI reports, wear loose comfortable clothing, avoid a big meal 2–3 hours before, and arrive on time so you get your full session.'],
  ['Do RMTs provide insurance receipts?', 'Yes. Massage therapy with our Registered Massage Therapists, including lymphatic drainage and buccal facial massage, is provided with RMT receipts you can submit to your insurance.']
];

module.exports = { PRICING, SERVICE_PAGES, CONCERNS, BIOS, ABOUT, TESTIMONIAL, FAQS, HST, NO_HST };
