/**
 * Set walk batch 75, part c (2026-10-15): the end of Marvel Super Heroes (MSH).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  lands,
  named,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Answer each modes question in turn with the next of `answers`. */
function modesInTurn(seat: ScriptedController, ...answers: (readonly number[])[]): void {
  const queue = [...answers];
  seat.chooseModesFn = () => [...(queue.shift() ?? [])];
}

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("Widow's Bite", () => {
  it("without teamwork, one mode: -2/-2 kills a 2/2", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const bite = toHand(game, "Widow's Bite");
    expect(() => cast(game, bite, { modes: [0, 1], targets: [ref(giant), ref(bears)] })).toThrow(/mode/);
    cast(game, bite, { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("with teamwork 3, both modes: one creature gains deathtouch, another gets -2/-2", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const bite = toHand(game, "Widow's Bite");
    cast(game, bite, { kicked: true, tap: [giant], modes: [0, 1], targets: [ref(mine), ref(theirs)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(keywords(game, mine).has("deathtouch")).toBe(true);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("can't use teamwork without total power 3 to tap", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears");
    const bite = toHand(game, "Widow's Bite");
    expect(castOffers(game, bite).some((o) => o.kind === "cast-spell" && o.kicked === true)).toBe(false);
  });
});

describe("Atlantis Attacks", () => {
  it("one mode: the target player creates the 6/5 hexproof Leviathan", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const atlantis = toHand(game, "Atlantis Attacks");
    cast(game, atlantis, { modes: [0], targets: [ref(B)] });
    const [leviathan] = named(game, "Leviathan Token", B);
    expect(leviathan).toBeDefined();
    expect(pt(game, leviathan)).toEqual({ power: 6, toughness: 5 });
    expect(keywords(game, leviathan).has("hexproof")).toBe(true);
    expect(tokensNamed(game, "Leviathan Token", A)).toBe(0);
  });

  it("one mode: returns one or two nonland permanents", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const ring = spawn(game, "Sol Ring", B);
    const atlantis = toHand(game, "Atlantis Attacks");
    cast(game, atlantis, { modes: [1], targets: [ref(ring), null] });
    expect(zone(game, ring)).toBe("hand");
  });

  it("with teamwork 4, both: a Leviathan for you and two permanents bounced", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const wurm = spawn(game, "Craw Wurm");
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const atlantis = toHand(game, "Atlantis Attacks");
    cast(game, atlantis, {
      kicked: true,
      tap: [wurm],
      modes: [0, 1],
      targets: [ref(A), ref(ring), ref(bears)],
    });
    expect(tokensNamed(game, "Leviathan Token", A)).toBe(1);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("White Tiger, Ava Ayala", () => {
  it("powers up once: a +1/+1 counter and The Tiger God, a legendary 4/4 blocked by at most one", () => {
    const { game } = table();
    const tiger = spawn(game, "White Tiger, Ava Ayala");
    lands(game, "Forest", 12);
    activate(game, tiger, 0);
    expect(counters(game, tiger)).toBe(1);
    const [god] = named(game, "The Tiger God");
    expect(god).toBeDefined();
    expect(pt(game, god)).toEqual({ power: 4, toughness: 4 });
    expect(supertypes(game, god)).toContain("legendary");
    expect(subtypes(game, god)).toEqual(expect.arrayContaining(["Cat", "God"]));
    expect(() => activate(game, tiger, 0)).toThrow();
  });
});

describe("Helicarrier Strike", () => {
  it("deals 2 to an attacking creature, or 4 with teamwork", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const wurm = spawn(game, "Craw Wurm"); // 6/4
    const wurm2 = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: wurm, defender: B },
      { attacker: wurm2, defender: B },
    ];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Helicarrier Strike"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    cast(game, toHand(game, "Helicarrier Strike"), { kicked: true, tap: [bears], targets: [ref(wurm2)] });
    expect(zone(game, wurm2)).toBe("graveyard");
  });

  it("can't target a creature that isn't attacking or blocking", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Helicarrier Strike"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Hire a Crew", () => {
  it("makes a Villain, then your creatures, the Villain included, get +1/+0", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hire a Crew"));
    const [villain] = named(game, "Villain Token", A);
    expect(pt(game, villain)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, villain).has("menace")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("K'un-Lun Warrior", () => {
  it("may sacrifice an artifact to draw a card", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    modesInTurn(a, [0], [0]);
    const before = hand(game).length;
    enter(game, "K'un-Lun Warrior");
    expect(zone(game, ring)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("may discard a card to draw a card", () => {
    const { game, a } = table();
    const opt = toHand(game, "Opt");
    a.chooseDiscardsFn = () => [opt];
    modesInTurn(a, [0], [1]);
    const before = hand(game).length;
    enter(game, "K'un-Lun Warrior");
    expect(zone(game, opt)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(hand(game)).not.toContain(opt);
  });

  it("draws nothing when it declines", () => {
    const { game, a } = table();
    spawn(game, "Sol Ring");
    modesInTurn(a, []);
    const before = hand(game).length;
    enter(game, "K'un-Lun Warrior");
    expect(hand(game).length).toBe(before);
  });
});

describe("Falcon, Winged Wonder", () => {
  it("creates Redwing, a legendary 1/1 flier that surveils 1 when it attacks", () => {
    const { game, a } = table();
    enter(game, "Falcon, Winged Wonder");
    const [redwing] = named(game, "Redwing", A);
    expect(redwing).toBeDefined();
    expect(supertypes(game, redwing)).toContain("legendary");
    expect(keywords(game, redwing).has("flying")).toBe(true);
    expect(pt(game, redwing)).toEqual({ power: 1, toughness: 1 });
    game.state.objects[redwing].summoningSick = false;
    const top = toLibrary(game, "Opt");
    let looked: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards, mode) => {
      if (mode === "surveil") looked = cards;
      return cards;
    };
    attack(game, a, [redwing]);
    expect(looked).toEqual([top]);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Reptil, Dinomorpher", () => {
  it("becomes a 3/5 Dinosaur Hero with reach and vigilance, then a 6/6 with trample, until end of turn", () => {
    const { game } = table();
    const reptil = spawn(game, "Reptil, Dinomorpher");
    lands(game, "Forest", 9);
    activate(game, reptil, 0);
    expect(pt(game, reptil)).toEqual({ power: 3, toughness: 5 });
    expect(subtypes(game, reptil)).toEqual(expect.arrayContaining(["Dinosaur", "Hero"]));
    expect(subtypes(game, reptil)).not.toContain("Human");
    expect(keywords(game, reptil).has("reach")).toBe(true);
    expect(keywords(game, reptil).has("vigilance")).toBe(true);
    activate(game, reptil, 1);
    expect(pt(game, reptil)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, reptil).has("trample")).toBe(true);
    expect(keywords(game, reptil).has("reach")).toBe(true);
    nextTurn(game);
    expect(pt(game, reptil)).toEqual({ power: 1, toughness: 2 });
    expect(subtypes(game, reptil)).toContain("Human");
    expect(keywords(game, reptil).has("trample")).toBe(false);
  });
});

describe("Truck Toss", () => {
  it("costs {2} less with a Vehicle, and deals 4 damage to any target", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const toss = toHand(game, "Truck Toss");
    const wurm = spawn(game, "Craw Wurm", B);
    expect(() => cast(game, toss, { targets: [ref(wurm)] })).toThrow();
    spawn(game, "Adventurer's Airship");
    cast(game, toss, { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("U.S.Agent, John Walker", () => {
  it("creates Sturdy Shield attached to him: a 4/4", () => {
    const { game } = table();
    const agent = enter(game, "U.S.Agent, John Walker");
    const [shield] = named(game, "Sturdy Shield Token", A);
    expect(shield).toBeDefined();
    expect(game.state.objects[shield].attachedTo).toBe(agent);
    expect(pt(game, agent)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Rick Jones, Destined Sidekick", () => {
  it("mills four and may put a Hero or enchantment card from among them into your hand", () => {
    const { game, a } = table();
    const rick = spawn(game, "Rick Jones, Destined Sidekick");
    lands(game, "Forest", 3);
    const older = toGraveyard(game, "Glorious Anthem");
    const bears = toLibrary(game, "Grizzly Bears");
    const anthem = toLibrary(game, "Glorious Anthem");
    const hero = toLibrary(game, "White Tiger, Ava Ayala");
    const opt = toLibrary(game, "Opt");
    const pick = pickFromZone(a, hero);
    activate(game, rick, 0);
    for (const id of [bears, anthem, opt]) expect(zone(game, id)).toBe("graveyard");
    expect([...pick.offered].sort()).toEqual([anthem, hero].sort());
    expect(pick.offered).not.toContain(older);
    expect(zone(game, hero)).toBe("hand");
    expect(graveyard(game)).toContain(anthem);
  });
});
