/**
 * Phyrexia: All Will Be One (ONE/ONC), batch 1, group e (2026-10-17).
 * Written on the shared table in `harness.ts`, each test from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics, restrictionsOf } from "../characteristics.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const poison = (game: Game, player: PlayerId): number => game.state.players[player].counters.poison ?? 0;
const setPoison = (game: Game, player: PlayerId, n: number): void => {
  game.state.players[player].counters.poison = n;
};
const setOil = (game: Game, id: ObjectId, n: number): void => {
  game.state.objects[id].counters.oil = n;
};
const attachTo = (game: Game, equipment: ObjectId, creature: ObjectId): void => {
  game.debugApplyEffect(game.state.objects[equipment].controller, { kind: "attach", target: 0 }, [ref(creature)], {
    source: equipment,
  });
  settle(game);
};
const colorsOf = (game: Game, id: ObjectId): readonly string[] => [
  ...computeCharacteristics(game.state, registryOf(game), id).colors,
];

describe("Kaya, Intangible Slayer", () => {
  it("−3: exiles an opponent's creature and you get a 1/1 white Spirit flying copy of it", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya, Intangible Slayer");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, kaya, -3, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    const [copy] = named(game, "Grizzly Bears", A);
    expect(copy).toBeDefined();
    expect(game.state.objects[copy].isToken).toBe(true);
    expect(pt(game, copy)).toEqual({ power: 1, toughness: 1 });
    expect(colorsOf(game, copy)).toEqual(["W"]);
    expect(types(game, copy)).toContain("creature");
    expect(subtypes(game, copy)).toEqual(expect.arrayContaining(["Bear", "Spirit"]));
    expect(keywords(game, copy).has("flying")).toBe(true);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
  });

  it("−3: an exiled token is copied as it last existed", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya, Intangible Slayer");
    const rebel = spawn(game, "Rebel Token", B);
    loyalty(game, kaya, -3, { targets: [ref(rebel)] });
    expect(tokensNamed(game, "Rebel Token", B)).toBe(0);
    expect(tokensNamed(game, "Rebel Token", A)).toBe(1);
    const [copy] = named(game, "Rebel Token", A);
    expect(pt(game, copy)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, copy)).toEqual(expect.arrayContaining(["Rebel", "Spirit"]));
  });

  it("−3: an Aura is exiled with no copy made", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya, Intangible Slayer");
    const bears = spawn(game, "Grizzly Bears", B);
    const pacifism = spawn(game, "Pacifism", B);
    attachTo(game, pacifism, bears);
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
    loyalty(game, kaya, -3, { targets: [ref(pacifism)] });
    expect(zone(game, pacifism)).toBe("exile");
    expect(named(game, "Pacifism")).toHaveLength(0);
  });

  it("0: you draw two cards, then each opponent may scry 1", () => {
    const { game, b } = table();
    const kaya = spawn(game, "Kaya, Intangible Slayer");
    let scried = 0;
    b.chooseModesFn = () => [0];
    b.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    const before = hand(game).length;
    loyalty(game, kaya, 0);
    expect(hand(game).length).toBe(before + 2);
    expect(scried).toBe(1);
  });
});

describe("Myr Custodian", () => {
  it("scries 2, then each opponent may scry 1", () => {
    const { game, a, b } = table();
    const mine: number[] = [];
    let theirs = 0;
    a.chooseScryFn = (_view, cards) => {
      mine.push(cards.length);
      return [];
    };
    b.chooseModesFn = () => [0];
    b.chooseScryFn = (_view, cards) => {
      theirs += cards.length;
      return [];
    };
    enter(game, "Myr Custodian");
    expect(mine).toEqual([2]);
    expect(theirs).toBe(1);
  });
});

describe("Phyrexian Atlas", () => {
  it("corrupted: becoming tapped makes each opponent with three or more poison counters lose 1 life", () => {
    const { game } = table({ players: 3 });
    const atlas = spawn(game, "Phyrexian Atlas");
    setPoison(game, B, 3);
    setPoison(game, C, 2);
    activate(game, atlas, 0);
    expect(game.state.objects[atlas].tapped).toBe(true);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });
});

describe("Jor Kadeen, First Goldwarden", () => {
  it("gets +X/+X for equipped creatures you control, and draws only if its power is then 4 or greater", () => {
    const one = table();
    const jor = spawn(one.game, "Jor Kadeen, First Goldwarden");
    const bears = spawn(one.game, "Grizzly Bears");
    attachTo(one.game, spawn(one.game, "Vulshok Splitter"), bears);
    const before = hand(one.game).length;
    attack(one.game, one.a, [jor]);
    expect(pt(one.game, jor)).toEqual({ power: 3, toughness: 3 });
    expect(hand(one.game).length).toBe(before);

    const two = table();
    const jor2 = spawn(two.game, "Jor Kadeen, First Goldwarden");
    for (const name of ["Grizzly Bears", "Grizzly Bears"]) {
      attachTo(two.game, spawn(two.game, "Vulshok Splitter"), spawn(two.game, name));
    }
    // An opponent's equipped creature isn't counted.
    attachTo(two.game, spawn(two.game, "Vulshok Splitter", B), spawn(two.game, "Grizzly Bears", B));
    const before2 = hand(two.game).length;
    attack(two.game, two.a, [jor2]);
    expect(pt(two.game, jor2)).toEqual({ power: 4, toughness: 4 });
    expect(hand(two.game).length).toBe(before2 + 1);
  });
});

describe("Hexgold Hoverwings", () => {
  it("For Mirrodin! makes a flying Rebel, and every equipped creature you control gets +1/+0", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Vulshok Splitter"), bears);
    const theirs = spawn(game, "Grizzly Bears", B);
    attachTo(game, spawn(game, "Vulshok Splitter", B), theirs);
    enter(game, "Hexgold Hoverwings");
    const [rebel] = named(game, "Rebel Token", A);
    expect(keywords(game, rebel).has("flying")).toBe(true);
    expect(pt(game, rebel)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Hazardous Blast", () => {
  it("deals 1 to each opponent's creature, and they can't block this turn — even one that arrives later", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const elves = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Hazardous Blast"));
    expect(zone(game, elves)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[mine].damageMarked).toBe(0);
    const registry = registryOf(game);
    expect(restrictionsOf(game.state, registry, bears).has("cant-block")).toBe(true);
    expect(restrictionsOf(game.state, registry, mine).has("cant-block")).toBe(false);
    const late = spawn(game, "Grizzly Bears", B);
    expect(restrictionsOf(game.state, registry, late).has("cant-block")).toBe(true);
  });
});

describe("Atraxa's Skitterfang", () => {
  it("enters with three oil counters; at combat, removing one gives a creature you control your choice of keyword", () => {
    const { game, a } = table();
    const fang = enter(game, "Atraxa's Skitterfang");
    expect(counters(game, fang, "oil")).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.chooseModesFn = (_view, _min, _max, texts) => (texts.length === 4 ? [2] : [0]);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, fang, "oil")).toBe(2);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("isn't offered with no oil counter to remove", () => {
    const { game, a } = table();
    const fang = spawn(game, "Atraxa's Skitterfang");
    setOil(game, fang, 0);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(0);
  });
});

describe("Forgehammer Centurion", () => {
  it("gets an oil counter when another creature or artifact you control goes to the graveyard", () => {
    const { game } = table();
    const centurion = spawn(game, "Forgehammer Centurion");
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, centurion, "oil")).toBe(1);
  });

  it("attacking, removing two oil counters makes target creature unable to block", () => {
    const { game, a } = table();
    const centurion = spawn(game, "Forgehammer Centurion");
    setOil(game, centurion, 2);
    const wall = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    pickTargets(a, wall);
    attack(game, a, [centurion]);
    expect(counters(game, centurion, "oil")).toBe(0);
    expect(restrictionsOf(game.state, registryOf(game), wall).has("cant-block")).toBe(true);
  });

  it("isn't offered with only one oil counter", () => {
    const { game, a } = table();
    const centurion = spawn(game, "Forgehammer Centurion");
    setOil(game, centurion, 1);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    attack(game, a, [centurion]);
    expect(asked).toBe(0);
    expect(counters(game, centurion, "oil")).toBe(1);
  });
});

describe("Necrosquito", () => {
  it("enters with two oil counters as a 2/2 and grows when another creature or artifact you control dies", () => {
    const { game } = table();
    const squito = enter(game, "Necrosquito");
    expect(pt(game, squito)).toEqual({ power: 2, toughness: 2 });
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(pt(game, squito)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Urabrask's Anointer", () => {
  it("deals X damage, X the permanents you control with oil counters", () => {
    const { game, a } = table();
    setOil(game, spawn(game, "Incubation Sac"), 1);
    setOil(game, spawn(game, "Predation Steward"), 2);
    spawn(game, "Grizzly Bears");
    setOil(game, spawn(game, "Incubation Sac", B), 3);
    pickTargets(a, B);
    enter(game, "Urabrask's Anointer");
    expect(life(game, B)).toBe(18);
  });
});

describe("Ravenous Necrotitan", () => {
  it("makes you sacrifice a creature unless an opponent has three or more poison counters", () => {
    const one = table();
    const bears = spawn(one.game, "Grizzly Bears");
    one.a.chooseSacrificesFn = () => [bears];
    enter(one.game, "Ravenous Necrotitan");
    expect(zone(one.game, bears)).toBe("graveyard");

    const two = table();
    const bears2 = spawn(two.game, "Grizzly Bears");
    setPoison(two.game, B, 3);
    const titan = enter(two.game, "Ravenous Necrotitan");
    expect(zone(two.game, bears2)).toBe("battlefield");
    expect(zone(two.game, titan)).toBe("battlefield");
  });
});

describe("Distorted Curiosity", () => {
  it("corrupted: costs {2} less while an opponent has three or more poison counters", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const card = toHand(game, "Distorted Curiosity");
    expect(() => cast(game, card)).toThrow();
    setPoison(game, B, 3);
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Tablet of Compleation", () => {
  it("makes mana only with two oil counters and draws only with five", () => {
    const { game } = table();
    const tablet = spawn(game, "Tablet of Compleation");
    lands(game, "Wastes", 1);
    setOil(game, tablet, 1);
    expect(() => activate(game, tablet, 1)).toThrow();
    activate(game, tablet, 0);
    expect(counters(game, tablet, "oil")).toBe(2);
    game.state.objects[tablet].tapped = false;
    setOil(game, tablet, 4);
    expect(() => activate(game, tablet, 2)).toThrow();
    setOil(game, tablet, 5);
    const before = hand(game).length;
    activate(game, tablet, 2);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Meldweb Strider", () => {
  it("enters with an oil counter, and removing it makes it an artifact creature", () => {
    const { game } = table();
    const strider = enter(game, "Meldweb Strider");
    expect(counters(game, strider, "oil")).toBe(1);
    expect(types(game, strider)).not.toContain("creature");
    activate(game, strider, 0);
    expect(counters(game, strider, "oil")).toBe(0);
    expect(types(game, strider)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(() => activate(game, strider, 0)).toThrow();
  });
});

describe("Tainted Observer", () => {
  it("another creature entering lets you pay {2} to proliferate", () => {
    const { game, a } = table();
    spawn(game, "Tainted Observer");
    lands(game, "Wastes", 2);
    setPoison(game, B, 1);
    a.chooseModesFn = () => [0];
    a.chooseProliferateFn = (_view, eligible) => eligible;
    enter(game, "Grizzly Bears");
    expect(poison(game, B)).toBe(2);
  });
});

describe("Infested Fleshcutter", () => {
  it("equipped creature attacking makes a Phyrexian Mite", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Infested Fleshcutter"), bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Phyrexian Mite Token", A)).toBe(1);
  });
});

describe("Duelist of Deep Faith", () => {
  it("has toxic 1, and first strike only during your turn", () => {
    const { game, a } = table();
    const duelist = spawn(game, "Duelist of Deep Faith");
    expect(keywords(game, duelist).has("first-strike")).toBe(true);
    attack(game, a, [duelist]);
    expect(poison(game, B)).toBe(1);
    expect(life(game, B)).toBe(18);
    toLibrary(game, "Wastes", B);
    toStep(game, "precombat-main", B);
    expect(keywords(game, duelist).has("first-strike")).toBe(false);
  });
});
