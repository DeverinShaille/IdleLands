
import { Profession, Stat, ICombatWeightedSkillChoice } from '../../interfaces';
import { Attack, RegenerateHP, RegenerateSpecial, SummonCreature } from './all';
import { Targets, EffectsPerTarget, Description, Accuracy, StatMod, Targetting,
  Delay, Duration, NumberOfTargets, CombatEffect, RandomNumber, SameTarget, AttackAccuracy } from '../skillcomponents';
import { Immediate } from '../skillcomponents/Immediate';

/**
 * These skills always happen. All of them. Each round. Used for regen effects and the like.
 */
export const ProfessionPreRoundSkillMap: { [key in Profession]: ICombatWeightedSkillChoice[] } = {
  [Profession.Archer]: [
  ],

  [Profession.Barbarian]: [
    { skills: [RegenerateHP(caster => caster.maxStats[Stat.HP] / 20)],
              canUse: (caster, combat) => caster.stats[Stat.HP] < caster.maxStats[Stat.HP] }
  ],

  [Profession.Bard]: [
    { skills: [RegenerateSpecial(1)],
      canUse: (caster, combat) => combat.currentRound % 3 === 1
                               && caster.stats[Stat.SPECIAL] < caster.maxStats[Stat.SPECIAL] }
  ],

  [Profession.Bitomancer]: [
  ],

  [Profession.Cleric]: [
    { skills: [RegenerateSpecial((caster) => caster.stats[Stat.INT] / 20)],
      canUse: (caster, combat) => caster.stats[Stat.SPECIAL] < caster.maxStats[Stat.SPECIAL] }
  ],

  [Profession.Fighter]: [
    { skills: [RegenerateHP(caster => (caster.maxStats[Stat.HP] - caster.stats[Stat.HP]) / 20)],
              canUse: (caster, combat) => caster.stats[Stat.HP] < caster.maxStats[Stat.HP] }
  ],

  [Profession.Generalist]: [
    { skills: [RegenerateHP(caster => (caster.maxStats[Stat.HP] - caster.stats[Stat.HP]) / 100)],
              canUse: (caster, combat) => caster.stats[Stat.HP] < caster.maxStats[Stat.HP] }
  ],

  [Profession.Jester]: [
  ],

  [Profession.Mage]: [
    { skills: [RegenerateSpecial((caster) => caster.maxStats[Stat.SPECIAL] / 20)],
      canUse: (caster, combat) => caster.stats[Stat.SPECIAL] < caster.maxStats[Stat.SPECIAL] }
  ],

  [Profession.MagicalMonster]: [
  ],

  [Profession.Monster]: [
    { skills: [RegenerateHP(caster => caster.maxStats[Stat.HP] / 100)],
              canUse: (caster, combat) => caster.stats[Stat.HP] < caster.maxStats[Stat.HP] }
  ],

  [Profession.Necromancer]: [
    { skills: [RegenerateHP(caster => (caster.maxStats[Stat.HP] - caster.stats[Stat.HP]) / 10)],
              canUse: (caster, combat) => caster.stats[Stat.HP] < caster.maxStats[Stat.HP] }
  ],

  [Profession.Pirate]: [
    { skills: [RegenerateHP(caster => (caster.maxStats[Stat.HP] - caster.stats[Stat.HP]) / 10)],
              canUse: (caster, combat) => caster.stats[Stat.HP] < caster.maxStats[Stat.HP] }
  ],

  [Profession.Rogue]: [
    { skills: [RegenerateSpecial(5)], canUse: (caster, combat) => caster.stats[Stat.SPECIAL] < caster.maxStats[Stat.SPECIAL] }
  ],

  [Profession.SandwichArtist]: [
  ]
};

/**
 * These skills also always happen, just at the end of the round. Mostly to sync numbers.
 */
export const ProfessionPostRoundSkillMap: { [key in Profession]: ICombatWeightedSkillChoice[] } = {
  [Profession.Archer]: [
  ],

  [Profession.Barbarian]: [
  ],

  [Profession.Bard]: [
  ],

  [Profession.Bitomancer]: [
  ],

  [Profession.Cleric]: [
  ],

  [Profession.Fighter]: [
  ],

  [Profession.Generalist]: [
  ],

  [Profession.Jester]: [
  ],

  [Profession.Mage]: [
  ],

  [Profession.MagicalMonster]: [
  ],

  [Profession.Monster]: [
  ],

  [Profession.Necromancer]: [

    // set special to # minions
    { skills: [RegenerateSpecial((skill, caster, combat) => {
      const cur = caster.stats[Stat.SPECIAL];
      const setTo = Object.values(combat.characters).filter(x => x.summonerId === caster.combatId).length;

      return setTo - cur;
    }, true) ] }
  ],

  [Profession.Pirate]: [
  ],

  [Profession.Rogue]: [
  ],

  [Profession.SandwichArtist]: [
  ]
};

/**
 * These abilities are locked to player professions.
 */
export const ProfessionSkillMap: { [key in Profession]: ICombatWeightedSkillChoice[] } = {
  [Profession.Archer]: [
    { weight: 3, skills: [Attack(
      (attacker) => attacker.stats[Stat.DEX],
      (attacker) => attacker.stats[Stat.DEX] * 0.75,
      70
    )] },

    // strong shot
    { weight: 4, canUse: (caster) => caster.stats[Stat.SPECIAL] >= 2, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        StatMod(Stat.SPECIAL, -2)
      ],
      [
        Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(90),
        Description('%source shot a strong arrow at %target and dealt %value damage!'),
        StatMod(Stat.HP, RandomNumber(
          (caster) => (caster.stats[Stat.DEX] + caster.stats[Stat.STR]) * 0.25,
          (caster) => (caster.stats[Stat.DEX] + caster.stats[Stat.STR])
        ))
      ]
    ] },

    // spreadshot
    { weight: 2,
      canUse: (caster, combat) => {
        const numTargets = NumberOfTargets(Targetting.AllEnemies, caster, combat);
        return numTargets > 1 && caster.stats[Stat.SPECIAL] >= numTargets;
      },
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster, target, combat) => -NumberOfTargets(Targetting.AllEnemies, caster, combat))
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1), Accuracy(90),
          Description('%source shot many arrows; one hit %target and dealt %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => (caster.stats[Stat.DEX] + caster.stats[Stat.STR]) * 0.5,
            (caster) => (caster.stats[Stat.DEX] + caster.stats[Stat.STR]) * 0.7
          ))
        ]
    ] },

    // relentless assault
    { weight: 2,
      canUse: (caster, combat) => caster.stats[Stat.SPECIAL] >= 20,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, -20)
        ],
        ...Array(20).fill([
          Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(50),
          Description('%source unleashed a relentless assault on %target and dealt %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => (caster.stats[Stat.DEX] + caster.stats[Stat.STR]) * 0.1,
            (caster) => (caster.stats[Stat.DEX] + caster.stats[Stat.STR]) * 0.15
          ))
        ])
    ] },
  ],

  [Profession.Barbarian]: [
    { weight: 3, skills: [
      Attack(
        (attacker) => attacker.stats[Stat.STR] * 0.25,
        (attacker) => attacker.stats[Stat.STR] * 1.5
      ),
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        StatMod(Stat.SPECIAL, 5)
      ]
    ] },

    // enrage
    { weight: 1, canUse: (caster) => caster.stats[Stat.SPECIAL] <= caster.maxStats[Stat.SPECIAL], skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source flew into a wild rage!'),
        StatMod(Stat.SPECIAL, 10)
      ]
    ] },

    // rage strike
    { weight: 3, canUse: (caster) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 5, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        StatMod(Stat.SPECIAL, (caster) => -caster.stats[Stat.SPECIAL])
      ],
      [
        Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(80),
        Description('%source unleashed an enraged attack on %target and dealt %value damage!'),
        StatMod(Stat.HP, (caster, target) => -caster.stats[Stat.STR] * (1 + 1 / caster.stats[Stat.SPECIAL]))
      ]
    ] },

    // rage boost
    { weight: 1, canUse: (caster) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 5, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        StatMod(Stat.SPECIAL, (caster) => -caster.stats[Stat.SPECIAL])
      ],
      [
        Targets(Targetting.Self), EffectsPerTarget(1), Accuracy(100),
        Description('%source enraged their muscles!'),
        StatMod(Stat.STR, (caster, target) => caster.stats[Stat.STR] * (1 / caster.stats[Stat.SPECIAL]))
      ]
    ] },
  ],

  [Profession.Bard]: [
    { weight: 2, skills: [Attack()] },

    // litany of pain
    { weight: 3, canUse: (caster) => caster.stats[Stat.SPECIAL] > 0, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source sang a Litany of Pain!'),
        StatMod(Stat.SPECIAL, -1)
      ],
      [
        Targets(Targetting.AllEnemies), EffectsPerTarget(1), Delay(2), Duration(3), Accuracy(90),
        Description('%source sang a Litany of Pain for %target and dealt %value damage!'),
        StatMod(Stat.HP, (caster, target) => -target.maxStats[Stat.HP] / 20)
      ]
    ] },

    // light from the stars
    { weight: 3, canUse: (caster) => caster.stats[Stat.SPECIAL] > 0, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source sang under the Light of the Stars!'),
        StatMod(Stat.SPECIAL, -1)
      ],
      [
        Targets(Targetting.AllAllies), EffectsPerTarget(1), Delay(2), Duration(3), Accuracy(95),
        Description('%source sang under the Light of the Stars for %target and healed %value health!'),
        StatMod(Stat.HP, (caster, target) => target.maxStats[Stat.HP] / 3)
      ]
    ] },

    // our hearts ignite
    { weight: 3, canUse: (caster) => caster.stats[Stat.SPECIAL] > 0, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source sang a song to Ignite Their Hearts!'),
        StatMod(Stat.SPECIAL, -1)
      ],
      [
        Targets(Targetting.AllAllies), EffectsPerTarget(1), Delay(2),
        Description('%source sang a song to Ignite Their Hearts for %target and increased their CON, STR, and INT!'),
      ],
      [
        Targets(Targetting.AllAllies), EffectsPerTarget(1), Delay(2),
        StatMod(Stat.STR, (caster, target) => target.maxStats[Stat.STR] / 10)
      ],
      [
        Targets(Targetting.AllAllies), EffectsPerTarget(1), Delay(2),
        StatMod(Stat.CON, (caster, target) => target.maxStats[Stat.CON] / 10)
      ],
      [
        Targets(Targetting.AllAllies), EffectsPerTarget(1), Delay(2),
        StatMod(Stat.INT, (caster, target) => target.maxStats[Stat.INT] / 10)
      ]
    ] }
  ],

  [Profession.Bitomancer]: [
    { weight: 3, skills: [Attack()] },

    // hack time
    { weight: 1, canUse: (caster) => caster.stats[Stat.SPECIAL] >= 128, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        StatMod(Stat.SPECIAL, -128)
      ],
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source hacked time!'),
        CombatEffect((combat) => combat.currentRound += 5)
      ]
    ] },

    // take a byte
    { weight: 3, canUse: (caster) => caster.stats[Stat.SPECIAL] > 0, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        StatMod(Stat.SPECIAL, (caster) => -caster.stats[Stat.SPECIAL])
      ],
      [
        Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(90),
        Description('%source took a byte out of %target and dealt %value damage!'),
        StatMod(Stat.HP, (caster) => caster.stats[Stat.SPECIAL])
      ]
    ] },

    // freeleech
    { weight: 2, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        StatMod(Stat.SPECIAL, (caster) => caster.maxStats[Stat.INT] / 10)
      ],
      [
        Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(80),
        Description('%source freeleeched %value INT from %target!'),
        StatMod(Stat.INT, (caster, target) => -target.maxStats[Stat.INT] / 10)
      ]
    ] }
  ],

  [Profession.Cleric]: [
    { weight: 2, skills: [Attack(
      1,
      (attacker) => attacker.stats[Stat.STR] * 0.5
    )] },

    // holy bolt
    { weight: 3,
      canUse: (caster) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 10,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => -caster.maxStats[Stat.SPECIAL] / 10)
        ],
        [
          Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(90),
          Description('%source flung a holy bolt at %target and dealt %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => caster.stats[Stat.INT] * 1.5,
            (caster) => caster.stats[Stat.INT] * 2.0
          ))
        ]
    ] },

    // heal
    { weight: 2,
      canUse: (caster, combat) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 20
                               && NumberOfTargets(Targetting.InjuredAlly, caster, combat) > 0,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => -caster.maxStats[Stat.SPECIAL] / 20)
        ],
        [
          Targets(Targetting.InjuredAlly), EffectsPerTarget(1), Accuracy(90),
          Description('%source surrounded %target with a holy aura and healed %value health!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => caster.stats[Stat.INT] * 2.0,
            (caster) => caster.stats[Stat.INT] * 3.0,
            true
          ))
        ]
    ] },

    // revive
    { weight: 2,
      canUse: (caster, combat) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 3
                               && NumberOfTargets(Targetting.DeadAlly, caster, combat) > 0,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => -caster.maxStats[Stat.SPECIAL] / 3)
        ],
        [
          Targets(Targetting.DeadAlly), EffectsPerTarget(1), Accuracy(100),
          Description('%source revived %target from their untimely demise!'),
          StatMod(Stat.HP, (caster, target) => Math.max(1, target.maxStats[Stat.HP] / 10))
        ]
    ] },
  ],

  [Profession.Fighter]: [
    { weight: 4, skills: [Attack(
      (attacker) => attacker.stats[Stat.STR] * 0.1,
      (attacker) => attacker.stats[Stat.STR]
    )] },

    // double attack
    { weight: 2, skills: [
      [
        Targets(Targetting.SingleEnemy), EffectsPerTarget(2), Accuracy(75),
        Description('%source attacked %target for %value damage!'),
        StatMod(Stat.HP, RandomNumber(
          (attacker) => attacker.stats[Stat.STR] * 0.1,
          (attacker) => attacker.stats[Stat.STR] * 0.9)
        )
      ]
    ] },

    // wild arms
    { weight: 2, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source bulked up and gained %value STR!'),
        StatMod(Stat.STR, (caster) => caster.maxStats[Stat.STR] / 10)
      ]
    ] },

    // multistrike
    { weight: 2,
      skills: [
        ...Array(5).fill([
          Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(50),
          Description('%source began swinging wildly at %target and dealt %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => caster.stats[Stat.STR] * 0.7,
            (caster) => caster.stats[Stat.STR] * 0.9
          ))
        ])
    ] }
  ],

  [Profession.Generalist]: [
    { weight: 3, skills: [Attack(
      1,
      (attacker) => (attacker.stats[Stat.STR] + attacker.stats[Stat.DEX] + attacker.stats[Stat.INT]
                   + attacker.stats[Stat.CON] + attacker.stats[Stat.AGI] + attacker.stats[Stat.LUK]) / 6,
      90
    )] },

    // sweeping generalization
    { weight: 2,
      canUse: (caster, combat) => NumberOfTargets(Targetting.AllEnemies, caster, combat) > 1,
      skills: [
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1), Accuracy(90),
          Description('%source hit %target with a sweeping generalization and dealt %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => (caster.stats[Stat.STR] + caster.stats[Stat.DEX] + caster.stats[Stat.INT]
                       + caster.stats[Stat.CON] + caster.stats[Stat.AGI] + caster.stats[Stat.LUK]) / 12,
            (caster) => (caster.stats[Stat.STR] + caster.stats[Stat.DEX] + caster.stats[Stat.INT]
                       + caster.stats[Stat.CON] + caster.stats[Stat.AGI] + caster.stats[Stat.LUK]) / 4,
          ))
        ]
    ] },

    // fortify
    { weight: 1, skills: [
      [
        Targets(Targetting.SingleAlly), EffectsPerTarget(1),
        StatMod(Stat.STR, (caster, target) => target.maxStats[Stat.STR] / 20),
        Description('%source swept %target under the rug and boosted their STR by %value!'),
      ],
      [
        Targets(Targetting.SingleAlly), EffectsPerTarget(1),
        StatMod(Stat.INT, (caster, target) => target.maxStats[Stat.INT] / 20),
        Description('%source swept %target under the rug and boosted their INT by %value!'),
      ],
      [
        Targets(Targetting.SingleAlly), EffectsPerTarget(1),
        StatMod(Stat.AGI, (caster, target) => target.maxStats[Stat.AGI] / 20),
        Description('%source swept %target under the rug and boosted their AGI by %value!'),
      ],
      [
        Targets(Targetting.SingleAlly), EffectsPerTarget(1),
        StatMod(Stat.DEX, (caster, target) => target.maxStats[Stat.DEX] / 20),
        Description('%source swept %target under the rug and boosted their DEX by %value!'),
      ],
      [
        Targets(Targetting.SingleAlly), EffectsPerTarget(1),
        StatMod(Stat.CON, (caster, target) => target.maxStats[Stat.CON] / 20),
        Description('%source swept %target under the rug and boosted their CON by %value!'),
      ],
      [
        Targets(Targetting.SingleAlly), EffectsPerTarget(1),
        StatMod(Stat.LUK, (caster, target) => target.maxStats[Stat.LUK] / 20),
        Description('%source swept %target under the rug and boosted their LUK by %value!'),
      ]
    ] },

    // restore
    { weight: 2, skills: [
      [
        Targets(Targetting.AllAllies), EffectsPerTarget(1), Accuracy(95),
        Description('%source let out a sweeping sigh and healed %target for %value health!'),
        StatMod(Stat.HP, (caster, target) => target.maxStats[Stat.HP] / 20)
      ]
    ] },
  ],

  [Profession.Jester]: [
    { weight: 3, skills: [Attack(
      1,
      (attacker) => attacker.stats[Stat.LUK] * 0.5,
      100
    )] },

    // luck surge
    { weight: 1, skills: [
      [
        Targets(Targetting.AllAllies), EffectsPerTarget(1),
        StatMod(Stat.LUK, (caster, target) => target.maxStats[Stat.LUK] / 20),
        Description('%source surged their immense luck into %target, boosting their LUK by %value!'),
      ],
      [
        Targets(Targetting.AllEnemies), EffectsPerTarget(1),
        StatMod(Stat.LUK, (caster, target) => target.maxStats[Stat.LUK] / 20),
        Description('%source surged their immense luck through %target, decreasing their LUK by %value!'),
      ]
    ] },

    // luck roulette
    { weight: 2, skills: [
      [
        Targets(Targetting.All), EffectsPerTarget(1),
        StatMod(Stat.HP, RandomNumber(
          (caster) => -caster.stats[Stat.LUK],
          (caster) => caster.stats[Stat.LUK],
          true
        )),
        Description('%source rolled the dice for %target, modifying their HP by %rvalue!'),
      ]
    ] },

    // lucky slap
    { weight: 2, skills: [
      [
        Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(25),
        StatMod(Stat.HP, RandomNumber(
          (caster) => caster.stats[Stat.LUK] * 3,
          (caster) => caster.stats[Stat.LUK] * 5
        )),
        Description('%source slapped %target which dealt %value damage!'),
      ]
    ] },

  ],

  [Profession.Mage]: [
    { weight: 2, skills: [Attack(
      (attacker) => attacker.stats[Stat.INT] * 0.25,
      (attacker) => attacker.stats[Stat.INT] * 0.75,
      AttackAccuracy.INT
    )] },

    // firestorm
    { weight: 2,
      canUse: (caster) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 10,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => -caster.maxStats[Stat.SPECIAL] / 10)
        ],
        ...Array(5).fill([
          Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(75),
          Description('%source flung a fireball at %target and dealt %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => caster.stats[Stat.INT] * 0.5,
            (caster) => caster.stats[Stat.INT]
          ))
        ])
    ] },

    // frostbite
    { weight: 2,
      canUse: (caster) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 15,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => -caster.maxStats[Stat.SPECIAL] / 15)
        ],
        [
          Targets(Targetting.SingleEnemy),
          SameTarget(
            [
              EffectsPerTarget(1),
              Description('%source gave %target frostbite and dealt %value damage!'),
              StatMod(Stat.HP, RandomNumber(
                (caster) => caster.stats[Stat.INT] * 1.5,
                (caster) => caster.stats[Stat.INT] * 2.0
              ))
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.DEX, (caster, target) => target.maxStats[Stat.DEX] / 5)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.AGI, (caster, target) => target.maxStats[Stat.AGI] / 5)
            ]
          )
        ]
    ] },

    // wild brain
    { weight: 1, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source brained up and gained %value INT!'),
        StatMod(Stat.INT, (caster) => caster.maxStats[Stat.INT] / 10)
      ]
    ] },
  ],

  [Profession.MagicalMonster]: [
    { weight: 3, skills: [Attack()] },

    // drain stats
    { weight: 3,
      canUse: (caster) => caster.stats[Stat.HP] >= caster.maxStats[Stat.HP] / 100,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.HP, (caster) => -caster.maxStats[Stat.HP] / 100)
        ],
        [
          Targets(Targetting.SingleEnemy),
          SameTarget(
            [
              EffectsPerTarget(1),
              Description('%source drained %target of their stats!')
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.STR, (caster, target) => target.maxStats[Stat.STR] / 50)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.INT, (caster, target) => target.maxStats[Stat.INT] / 50)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.AGI, (caster, target) => target.maxStats[Stat.AGI] / 50)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.DEX, (caster, target) => target.maxStats[Stat.DEX] / 50)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.CON, (caster, target) => target.maxStats[Stat.CON] / 50)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.LUK, (caster, target) => target.maxStats[Stat.LUK] / 50)
            ]
          )
        ]
    ] },

    // heal
    { weight: 2,
      canUse: (caster, combat) => NumberOfTargets(Targetting.InjuredAlly, caster, combat) > 0,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => -caster.maxStats[Stat.SPECIAL] / 20)
        ],
        [
          Targets(Targetting.InjuredAlly), EffectsPerTarget(1), Accuracy(90),
          Description('%source surrounded %target with a holy aura and healed %value health!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => caster.stats[Stat.INT] * 1.0,
            (caster) => caster.stats[Stat.INT] * 1.5,
            true
          ))
        ]
    ] },

    // firestorm
    { weight: 2,
      skills: [
        ...Array(3).fill([
          Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(75),
          Description('%source flung a fireball at %target and dealt %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => caster.stats[Stat.INT] * 0.3,
            (caster) => caster.stats[Stat.INT] * 0.8
          ))
        ])
    ] }
  ],

  [Profession.Monster]: [
    { weight: 3, skills: [Attack()] },

    // darkside
    { weight: 3,
      canUse: (caster) => caster.stats[Stat.HP] > 10,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.HP, (caster) => -caster.stats[Stat.HP] * 0.1)
        ],
        [
          Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(90),
          Description('%source unleashed their dark side on %target and dealt %value damage!'),
          StatMod(Stat.HP, (caster) => -caster.stats[Stat.HP] * 0.3)
        ]
    ] },

    // self heal
    { weight: 2,
      canUse: (caster, combat) => NumberOfTargets(Targetting.InjuredSelf, caster, combat) > 0,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          Description('%source went into stasis and recovered %value health!'),
          StatMod(Stat.HP, (caster) => caster.maxStats[Stat.HP] / 20)
        ]
    ] },

    // life force bomb
    { weight: 1,
      canUse: (caster) => caster.stats[Stat.HP] > 10,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.HP, (caster) => -caster.stats[Stat.HP] * 0.5)
        ],
        [
          Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(80),
          Description('%source channeled a massive life force bomb at %target and dealt %value damage!'),
          StatMod(Stat.HP, (caster) => -caster.stats[Stat.HP] * 0.5)
        ]
    ] },
  ],

  [Profession.Necromancer]: [
    { weight: 5, skills: [Attack()] },

    // drain stats
    { weight: 2,
      canUse: (caster) => caster.stats[Stat.HP] >= caster.maxStats[Stat.HP] / 20,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.HP, (caster) => -caster.maxStats[Stat.HP] / 20)
        ],
        [
          Targets(Targetting.SingleEnemy),
          SameTarget(
            [
              EffectsPerTarget(1),
              Description('%source drained %target of their stats!')
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.STR, (caster, target) => target.maxStats[Stat.STR] / 20)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.INT, (caster, target) => target.maxStats[Stat.INT] / 20)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.AGI, (caster, target) => target.maxStats[Stat.AGI] / 20)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.DEX, (caster, target) => target.maxStats[Stat.DEX] / 20)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.CON, (caster, target) => target.maxStats[Stat.CON] / 20)
            ],
            [
              EffectsPerTarget(1),
              StatMod(Stat.LUK, (caster, target) => target.maxStats[Stat.LUK] / 20)
            ]
          )
        ]
    ] },

    // drain hp
    { weight: 3,
      canUse: (caster) => caster.stats[Stat.HP] >= caster.maxStats[Stat.HP] / 20,
      skills: (combat, caster) => {

        // 1+ because otherwise if it does (min, max) and they're both 0 it throws
        const min = caster.stats[Stat.INT] * 0.1;
        const damage = combat.chance.integer({
          min,
          max: Math.max(min + 1, (caster.stats[Stat.INT] * 0.5))
        });

        return [
          [
            Targets(Targetting.Self), EffectsPerTarget(1),
            StatMod(Stat.HP, damage)
          ],
          [
            Targets(Targetting.SingleEnemy), EffectsPerTarget(1), Accuracy(90),
            Description('%source drained %target of %value of their health!'),
            StatMod(Stat.HP, () => -damage)
          ]
        ];
    } },

    // summon
    { weight: 1,
      canUse: (caster) => caster.stats[Stat.SPECIAL] < caster.maxStats[Stat.SPECIAL],
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          Description('%source summmoned a minion!'),
          StatMod(Stat.SPECIAL, 1)
        ],
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          CombatEffect(SummonCreature(0.3))
        ]
    ] }
  ],

  [Profession.Pirate]: [
    { weight: 3, skills: [Attack(
      (attacker) => attacker.stats[Stat.STR] * 0.25,
      (attacker) => attacker.stats[Stat.STR] * 1.5
    )] },

    // wild arms 2: pirate boogaloo
    { weight: 2,
      canUse: (caster) => caster.stats[Stat.SPECIAL] >= caster.maxStats[Stat.SPECIAL] / 10,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => -caster.maxStats[Stat.SPECIAL] / 10)
        ],
        [
          Targets(Targetting.SingleAlly), EffectsPerTarget(1),
          Description('%target got fed spinach beer by %source and gained %value STR!'),
          StatMod(Stat.STR, (caster) => caster.maxStats[Stat.STR] / 10)
        ]
    ] },

    // vomit
    { weight: 3,
      canUse: (caster) => caster.stats[Stat.SPECIAL] <= caster.maxStats[Stat.SPECIAL] * 0.35,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, (caster) => caster.maxStats[Stat.SPECIAL] * 0.2)
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1),
          Description('%source vomited all over %target dealing %value damage!'),
          StatMod(Stat.HP, RandomNumber(
            (caster) => caster.stats[Stat.CON],
            (caster) => caster.stats[Stat.CON] * 2.0
          ))
        ]
    ] },

    // throw bottles
    { weight: 3,
      canUse: (caster) => caster.stats[Stat.SPECIAL] > 50,
      skills: (combat) => {

        const bottleCount = combat.chance.integer({ min: 10, max: 50 });

        return [
          [
            Targets(Targetting.Self), EffectsPerTarget(1),
            StatMod(Stat.SPECIAL, -bottleCount)
          ],
          [
            Targets(Targetting.SingleEnemy), EffectsPerTarget(1),
            Description(`%source threw ${bottleCount} empty bottles at %target dealing %value damage!`),
            StatMod(Stat.HP, (caster, target) => -target.stats[Stat.HP] * (bottleCount / 200))
          ]
        ];
      }
    },
  ],

  [Profession.Rogue]: [
    { weight: 4, skills: [Attack(
      (attacker) => (attacker.stats[Stat.DEX] + attacker.stats[Stat.AGI] / 2) * 0.1,
      (attacker) => (attacker.stats[Stat.DEX] + attacker.stats[Stat.AGI] / 2),
      80
    )] },

    // poison stab
    { weight: 2,
      canUse: (caster, combat) => caster.stats[Stat.SPECIAL] >= 15,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, -15)
        ],
        [
          Targets(Targetting.SingleEnemy),
          SameTarget(
            [
              EffectsPerTarget(1), Accuracy(90),
              Description('%source stabbed %target with a poison dagger and dealt %value damage!'),
              StatMod(Stat.HP, RandomNumber(
                (caster) => caster.stats[Stat.DEX] * 1.0,
                (caster) => caster.stats[Stat.DEX] * 1.5
              ))
            ],
            [
              EffectsPerTarget(1), Accuracy(90), Delay(1), Duration(10),
              Description('%target took %value damage from %source\'s poison!'),
              StatMod(Stat.HP, RandomNumber(
                (caster) => caster.stats[Stat.DEX] * 0.4,
                (caster) => caster.stats[Stat.DEX] * 0.6
              ))
            ]
          )
        ]
    ] },


    // self recover
    { weight: 3,
      canUse: (caster) => caster.stats[Stat.SPECIAL] < 20,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          Description('%source took a quick nap and recovered %value energy!'),
          StatMod(Stat.SPECIAL, 15)
        ]
    ] },

    // smoke bomb
    { weight: 2,
      canUse: (caster) => caster.stats[Stat.SPECIAL] > 30,
      skills: [
        [
          Targets(Targetting.Self), EffectsPerTarget(1),
          StatMod(Stat.SPECIAL, -30)
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1),
          Description('%source threw a smoke bomb at %target!')
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1),
          StatMod(Stat.DEX, (caster, target) => -target.stats[Stat.DEX] * 0.2)
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1),
          StatMod(Stat.AGI, (caster, target) => -target.stats[Stat.AGI] * 0.2)
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1), Delay(3),
          Description('The smoke around %target has cleared!')
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1), Delay(3),
          StatMod(Stat.DEX, (caster, target) => target.stats[Stat.DEX] * 0.2)
        ],
        [
          Targets(Targetting.AllEnemies), EffectsPerTarget(1), Delay(3),
          StatMod(Stat.AGI, (caster, target) => target.stats[Stat.AGI] * 0.2)
        ]
    ] }
  ],

  [Profession.SandwichArtist]: [
    { weight: 3, skills: [Attack()] },

    // food fight
    { weight: 2, skills: [
      [
        Targets(Targetting.Self), EffectsPerTarget(1),
        Description('%source started a food fight!'),
        Immediate()
      ],
      [
        Targets(Targetting.AllButSelf), EffectsPerTarget(1), Accuracy(75),
        StatMod(Stat.HP, RandomNumber(
          (caster) => caster.stats[Stat.LUK],
          (caster) => caster.stats[Stat.LUK] * 2
        )),
        Description('%source hit %target with a sandwich for %value damage!'),
      ],
      [
        Targets(Targetting.AllButSelf), EffectsPerTarget(1), Accuracy(45),
        StatMod(Stat.STR, RandomNumber(
          (caster, target) => -target.maxStats[Stat.STR] / 20,
          (caster, target) => target.maxStats[Stat.STR] / 20
        ))
      ],
      [
        Targets(Targetting.AllButSelf), EffectsPerTarget(1), Accuracy(45),
        StatMod(Stat.INT, RandomNumber(
          (caster, target) => -target.maxStats[Stat.INT] / 20,
          (caster, target) => target.maxStats[Stat.INT] / 20
        ))
      ],
      [
        Targets(Targetting.AllButSelf), EffectsPerTarget(1), Accuracy(45),
        StatMod(Stat.AGI, RandomNumber(
          (caster, target) => -target.maxStats[Stat.AGI] / 20,
          (caster, target) => target.maxStats[Stat.AGI] / 20
        ))
      ],
      [
        Targets(Targetting.AllButSelf), EffectsPerTarget(1), Accuracy(45),
        StatMod(Stat.DEX, RandomNumber(
          (caster, target) => -target.maxStats[Stat.DEX] / 20,
          (caster, target) => target.maxStats[Stat.DEX] / 20
        ))
      ],
      [
        Targets(Targetting.AllButSelf), EffectsPerTarget(1), Accuracy(45),
        StatMod(Stat.CON, RandomNumber(
          (caster, target) => -target.maxStats[Stat.CON] / 20,
          (caster, target) => target.maxStats[Stat.CON] / 20
        ))
      ],
      [
        Targets(Targetting.AllButSelf), EffectsPerTarget(1), Accuracy(45),
        StatMod(Stat.LUK, RandomNumber(
          (caster, target) => -target.maxStats[Stat.LUK] / 20,
          (caster, target) => target.maxStats[Stat.LUK] / 20
        ))
      ]
    ] },

    // burnt sandwich
    { weight: 4,
      skills: [
        [
          Targets(Targetting.SingleEnemy),
          SameTarget(
            [
              EffectsPerTarget(1), Accuracy(90),
              Description('%source forced %target to eat a burnt sandwich which dealt %value damage!'),
              StatMod(Stat.HP, RandomNumber(
                (caster) => caster.stats[Stat.STR] * 1.0,
                (caster) => caster.stats[Stat.STR] * 1.5
              ))
            ],
            [
              EffectsPerTarget(1), Accuracy(90), Delay(1), Duration(RandomNumber(2, 4)),
              Description('%target took %value heartburn damage from %source\'s burnt sandwich!'),
              StatMod(Stat.HP, RandomNumber(
                (caster, target) => target.stats[Stat.CON] * 0.4,
                (caster, target) => target.stats[Stat.CON] * 0.6
              ))
            ]
          )
        ]
    ] },

    // heavenly sandwich
    { weight: 2,
      skills: [
        [
          Targets(Targetting.SingleAlly),
          SameTarget(
            [
              EffectsPerTarget(1), Accuracy(100),
              Description('%source fed a heavenly sandwich to %target which healed %value health!'),
              StatMod(Stat.HP, RandomNumber(
                (caster) => caster.stats[Stat.CON] * 1.0,
                (caster) => caster.stats[Stat.CON] * 1.5,
                true
              ))
            ],
            [
              EffectsPerTarget(1), Accuracy(90),
              StatMod(Stat.CON, RandomNumber(
                (caster) => caster.stats[Stat.CON] * 0.5,
                (caster) => caster.stats[Stat.CON] * 1.5
              ))
            ]
          )
        ]
    ] },
  ]
};
