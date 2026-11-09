/**
 * Object sets (`object-sets.ts`, theme 1's design note in
 * docs/plans/need-key-themes.md): one `ObjectSetRef` for every set of objects
 * a card refers to, each member read as it was once it has moved (rule
 * 608.2h) and acted on only in its stint (400.7); the aggregate over a set;
 * a delayed or reflexive trigger's remembered sets (theme 15); the player
 * aggregate. The proving cards of step 5 (B279) each get a test here.
 */

import { describe, expect, it } from "vitest";
import { POOL_CARDS, TOKEN_CARDS } from "../cards/generated.js";
import { isObjectSetRef } from "../object-sets.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  life,
  lands,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** Every value under `key` anywhere in `value`. */
function valuesAt(value: unknown, key: string, out: unknown[] = []): unknown[] {
  if (value === null || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) valuesAt(item, key, out);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    if (k === key) out.push(v);
    valuesAt(v, key, out);
  }
  return out;
}

const REMOVED = [
  "sumOf",
  "greatestOf",
  "triggerBatch",
  "exiledWithSourceManaValue",
  "exiledWithSourcePower",
  "exiledWithThis",
  "greatestAmongPlayers",
  "lowestLifeTotal",
  "sameNameAsThisWay",
];

describe("the pool on object sets", () => {
  it("spells no per-set shape the sets replaced", () => {
    const bad: string[] = [];
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) {
      for (const key of REMOVED) if (valuesAt(def, key).length > 0) bad.push(`${def.name}: ${key}`);
      for (const zoneIn of valuesAt(def, "in")) {
        if (zoneIn === "attackers" || (Array.isArray(zoneIn) && zoneIn.includes("attackers"))) bad.push(`${def.name}: in "attackers"`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("reads only a source's own sets in a characteristic-defining or counted static", () => {
    // A static has no resolution: its sets can only be the source's own
    // (`staticSetMembers`); a cost's, a trigger's or this way's name nothing.
    const bad: string[] = [];
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) {
      for (const st of def.static ?? []) {
        const counted = [st.setBasePtFromCount, st.grantPtPerCount, st.setBasePt];
        for (const zoneIn of valuesAt(counted, "in")) {
          for (const one of Array.isArray(zoneIn) ? zoneIn : [zoneIn]) {
            if (isObjectSetRef(one) && one !== "exiled-with-source" && !(typeof one === "object" && "attachmentsOf" in one)) {
              bad.push(`${def.name}: ${JSON.stringify(one)}`);
            }
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("a set member read as it was", () => {
  it("the sacrificed creature is read as it last existed (608.2h)", () => {
    // Dina, Soul Steeper-style reads now go through `{ paid: "sacrificed" }`:
    // Reign of the Pit's total is an aggregate over the creatures sacrificed
    // this way, each as it last existed — its counter included.
    const { game } = table();
    lands(game, "Swamp", 6);
    const mine = spawn(game, "Grizzly Bears");
    game.state.objects[mine].counters = { "+1/+1": 2 };
    spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Reign of the Pit"));
    expect(zone(game, mine)).toBe("graveyard");
    const demons = Object.values(game.state.objects).filter((o) => o.zone === "battlefield" && o.isToken);
    expect(demons.map((d) => pt(game, d.id))).toEqual([{ power: 5, toughness: 5 }]);
  });
});

describe("Synthetic Destiny — a delayed ability remembers what was exiled", () => {
  it("reveals until that many creature cards at the next end step, however the exiled cards move since", () => {
    const { game } = table({ deck: "Plains" });
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    toLibrary(game, "Hill Giant");
    toLibrary(game, "Plains");
    toLibrary(game, "Craw Wurm");
    cast(game, toHand(game, "Synthetic Destiny"));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, elves)).toBe("exile");
    // One of them leaves exile: still "that many" — two.
    game.debugMove(bears, "graveyard");
    toStep(game, "end");
    settle(game);
    const onBattlefield = Object.values(game.state.objects)
      .filter((o) => o.zone === "battlefield" && o.controller === A && o.cardName !== "Island")
      .map((o) => o.cardName)
      .sort();
    expect(onBattlefield).toEqual(["Craw Wurm", "Hill Giant"]);
  });
});

describe("Song of Blood — the milled creature cards, remembered for the turn", () => {
  it("gives each attacker +1/+0 for each creature card milled", () => {
    const { game, a } = table({ deck: "Plains" });
    lands(game, "Mountain", 2);
    const attacker = spawn(game, "Grizzly Bears");
    toLibrary(game, "Plains");
    toLibrary(game, "Hill Giant");
    toLibrary(game, "Plains");
    toLibrary(game, "Craw Wurm");
    cast(game, toHand(game, "Song of Blood"));
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName !== "Song of Blood")).toHaveLength(4);
    attack(game, a, [attacker]);
    expect(pt(game, attacker)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Resplendent Marshal — a reflexive ability remembers the exiled card", () => {
  it("counts on each other creature sharing a creature type with it", () => {
    const { game, a } = table();
    const warrior = spawn(game, "Raging Goblin");
    const bears = spawn(game, "Grizzly Bears");
    const exiled = toGraveyard(game, "Goblin Piker");
    pickModes(a, 0);
    pickFromZone(a, exiled);
    const marshal = enter(game, "Resplendent Marshal");
    expect(zone(game, exiled)).toBe("exile");
    expect(counters(game, warrior)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, marshal)).toBe(0);
  });
});

describe("Corpse Lunge, Necropolis, Dread Defiler — the card a cost exiled", () => {
  it("Corpse Lunge deals damage equal to the exiled card's power", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    cast(game, toHand(game, "Corpse Lunge"), { targets: [ref(wurm)] });
    expect(zone(game, giant)).toBe("exile");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });

  it("Necropolis puts +0/+1 counters equal to the exiled card's mana value", () => {
    const { game, a } = table();
    const wall = spawn(game, "Necropolis");
    const wurm = toGraveyard(game, "Craw Wurm");
    pickFromZone(a, wurm);
    activate(game, wall);
    expect(counters(game, wall, "+0/+1")).toBe(6);
  });

  it("Dread Defiler's opponent loses life equal to the exiled card's power", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const defiler = spawn(game, "Dread Defiler");
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    activate(game, defiler, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("characteristic-defining abilities over sets and sums", () => {
  it("Unlicensed Hearse is as big as the cards exiled with it", () => {
    const { game } = table();
    const hearse = spawn(game, "Unlicensed Hearse");
    const one = toGraveyard(game, "Grizzly Bears", B);
    const two = toGraveyard(game, "Hill Giant", B);
    activate(game, hearse, 0, { targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("exile");
    expect(pt(game, hearse)).toEqual({ power: 2, toughness: 2 });
    // One that leaves exile is no longer exiled with it.
    game.debugMove(one, "graveyard");
    expect(pt(game, hearse)).toEqual({ power: 1, toughness: 1 });
  });

  it("Abomination of Llanowar counts Elves you control and Elf cards in your graveyard, itself once", () => {
    const { game } = table();
    const abomination = spawn(game, "Abomination of Llanowar");
    spawn(game, "Llanowar Elves");
    toGraveyard(game, "Elvish Mystic");
    toGraveyard(game, "Elvish Mystic", B);
    expect(pt(game, abomination)).toEqual({ power: 3, toughness: 3 });
  });

  it("Dauntless Dourbark adds Forests and Treefolk, with trample beside another Treefolk", () => {
    const { game } = table();
    const dourbark = spawn(game, "Dauntless Dourbark");
    lands(game, "Forest", 2);
    expect(pt(game, dourbark)).toEqual({ power: 3, toughness: 3 });
    expect([...keywords(game, dourbark)]).not.toContain("trample");
    spawn(game, "Treefolk Seedlings");
    expect(pt(game, dourbark)).toEqual({ power: 4, toughness: 4 });
    expect([...keywords(game, dourbark)]).toContain("trample");
  });
});

describe("the player aggregate", () => {
  it("Malignus is half the highest life total among its opponents, rounded up", () => {
    const { game } = table({ players: 3 });
    const malignus = spawn(game, "Malignus");
    game.state.players[B].life = 15;
    game.state.players["carol" as typeof B].life = 9;
    game.state.players[A].life = 30;
    expect(pt(game, malignus)).toEqual({ power: 8, toughness: 8 });
  });

  it("Scourge of the Skyclaves is 20 minus the highest life total among players", () => {
    const { game } = table();
    game.state.players[A].life = 7;
    game.state.players[B].life = 12;
    const scourge = spawn(game, "Scourge of the Skyclaves");
    expect(pt(game, scourge)).toEqual({ power: 8, toughness: 8 });
  });

  it("Arbiter of Knollridge sets each life total to the highest", () => {
    const { game } = table({ players: 3 });
    game.state.players[B].life = 31;
    enter(game, "Arbiter of Knollridge");
    expect([life(game, A), life(game, B), life(game, "carol" as typeof B)]).toEqual([31, 31, 31]);
  });

  it("Balance keeps the fewest lands, cards and creatures each player has", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 4, B);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves", B);
    toHand(game, "Plains");
    toHand(game, "Plains", B);
    toHand(game, "Plains", B);
    toHand(game, "Plains", B);
    a.choosePermanentsFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    b.choosePermanentsFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    const balance = toHand(game, "Balance");
    cast(game, balance);
    const landCount = (p: typeof A): number =>
      Object.values(game.state.objects).filter((o) => o.zone === "battlefield" && o.controller === p && o.cardName !== "Grizzly Bears" && o.cardName !== "Llanowar Elves").length;
    const creatures = (p: typeof A): number =>
      Object.values(game.state.objects).filter((o) => o.zone === "battlefield" && o.controller === p && (o.cardName === "Grizzly Bears" || o.cardName === "Llanowar Elves")).length;
    expect([landCount(A), landCount(B)]).toEqual([2, 2]);
    expect([creatures(A), creatures(B)]).toEqual([1, 1]);
    // Bob discards down to the hand Alice has left once Balance is cast.
    const aliceHand = hand(game, A).length;
    expect(hand(game, B).length).toBe(aliceHand);
    // Two Forests sacrificed and one card discarded.
    expect(graveyard(game, B)).toHaveLength(3);
  });
});

describe("Cut Down — total power and toughness", () => {
  it("can target a 2/3 but not a 3/3", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const small = spawn(game, "Hill Giant", B);
    const ok = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Cut Down"), { targets: [ref(small)] })).toThrow();
    cast(game, toHand(game, "Cut Down"), { targets: [ref(ok)] });
    expect(zone(game, ok)).toBe("graveyard");
  });
});

describe("what's attached to the source", () => {
  it("Wyleth draws a card for each Aura and Equipment attached to it", () => {
    const { game, a } = table();
    const wyleth = spawn(game, "Wyleth, Soul of Steel");
    for (const name of ["Bonesplitter", "Short Sword"]) {
      const eq = spawn(game, name);
      game.state.objects[eq].attachedTo = wyleth;
    }
    const before = hand(game).length;
    attack(game, a, [wyleth]);
    expect(hand(game).length - before).toBe(2);
  });

  it("Valduk makes an Elemental for each, exiled at the next end step", () => {
    const { game } = table({ step: "upkeep" });
    const valduk = spawn(game, "Valduk, Keeper of the Flame");
    const eq = spawn(game, "Bonesplitter");
    game.state.objects[eq].attachedTo = valduk;
    toStep(game, "declare-attackers");
    const elementals = () => Object.values(game.state.objects).filter((o) => o.zone === "battlefield" && o.cardName === "3/1 Red Elemental Token");
    expect(elementals()).toHaveLength(1);
    toStep(game, "cleanup");
    expect(elementals()).toHaveLength(0);
  });

  it("Valduk gone before it resolves counts what was attached as it last existed (608.2h)", () => {
    const { game } = table({ step: "upkeep" });
    const valduk = spawn(game, "Valduk, Keeper of the Flame");
    for (const name of ["Bonesplitter", "Short Sword"]) {
      const eq = spawn(game, name);
      game.state.objects[eq].attachedTo = valduk;
    }
    game.advanceUntil((s) => s.turn.step === "begin-combat" && s.zones.shared.stack.length > 0);
    game.debugMove(valduk, "graveyard");
    settle(game);
    const elementals = Object.values(game.state.objects).filter((o) => o.zone === "battlefield" && o.cardName === "3/1 Red Elemental Token");
    expect(elementals).toHaveLength(2);
  });
});

describe("Thorin, Mountain-king — attached this way, then that creature bites", () => {
  it("attaches the Equipment, then the creature deals damage equal to its power", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    const wurm = spawn(game, "Craw Wurm", B);
    let call = 0;
    a.chooseTargetsFn = () => (call++ === 0 ? [ref(bears), ref(splitter)] : [ref(wurm)]);
    enter(game, "Thorin, Mountain-king");
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    // 2 + Bonesplitter's 2: the 6/4 Wurm dies of it.
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("attaching nothing triggers nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    let call = 0;
    a.chooseTargetsFn = () => (call++ === 0 ? [ref(bears)] : [ref(wurm)]);
    enter(game, "Thorin, Mountain-king");
    expect(call).toBe(1);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
  });
});

describe("Brass Infiniscope — the next X spell's X", () => {
  it("draws a card and gains half X, rounded down", () => {
    const { game } = table();
    const scope = spawn(game, "Brass Infiniscope");
    lands(game, "Mountain", 4);
    activate(game, scope);
    const before = hand(game).length;
    cast(game, toHand(game, "Fireball"), { x: 5, targets: [ref(B)] });
    expect(hand(game).length - before).toBe(1);
    expect(life(game, A)).toBe(22);
  });
});

describe("Captain Marvel, Apex Avenger — the same number and kind", () => {
  it("copies the counters put on another non-Kree creature", () => {
    const { game, a } = table();
    const marvel = spawn(game, "Captain Marvel, Apex Avenger");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(bears)]);
    settle(game);
    expect(counters(game, marvel)).toBe(2);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "flying", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(counters(game, marvel, "flying")).toBe(1);
  });
});

