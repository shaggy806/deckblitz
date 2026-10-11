/**
 * The set walk, batch 56, part b (2026-10-11): Marvel Super Heroes Commander.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  nextTurn,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** A permanent made a creature for good — a Vehicle that can attack without
 * crewing it. */
const animate = (game: ReturnType<typeof table>["game"], id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["creature"], duration: "permanent" }, [ref(id)]);

describe("Damocles Base, Sword of Kang", () => {
  it("the damaged player chooses to sacrifice a nontoken creature", () => {
    const { game, a, b } = table();
    const base = spawn(game, "Damocles Base, Sword of Kang");
    animate(game, base);
    const bears = spawn(game, "Grizzly Bears", B);
    const soldier = spawn(game, "Soldier Token", B);
    const cards = hand(game, A).length;
    b.chooseModesFn = () => [0];
    attack(game, a, [base]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[soldier]?.zone).toBe("battlefield");
    expect(hand(game, A)).toHaveLength(cards);
  });

  it("or to lose 2 life while you draw two cards", () => {
    const { game, a, b } = table();
    const base = spawn(game, "Damocles Base, Sword of Kang");
    animate(game, base);
    const bears = spawn(game, "Grizzly Bears", B);
    const cards = hand(game, A).length;
    b.chooseModesFn = () => [1];
    attack(game, a, [base]);
    expect(life(game, B)).toBe(13);
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, A)).toHaveLength(cards + 2);
  });
});

describe("Wanda's Vision", () => {
  it("on the second spell of the turn, exiles to a nonland card and casts it free", () => {
    const { game, a } = table();
    spawn(game, "Wanda's Vision");
    lands(game, "Forest", 4);
    const first = toHand(game, "Grizzly Bears");
    const second = toHand(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const top = toLibrary(game, "Wastes");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === giant);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: giant, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    cast(game, first);
    // The first spell doesn't trigger it.
    expect(zone(game, giant)).toBe("library");
    cast(game, second);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, top)).toBe("exile");
  });
});

describe("T'Challa, the Black Panther", () => {
  it("grows on an artifact spell with mana value 4 or greater, not a smaller one", () => {
    const { game } = table();
    const tchalla = spawn(game, "T'Challa, the Black Panther");
    lands(game, "Wastes", 7);
    cast(game, toHand(game, "Chief of the Foundry")); // {3}
    expect(counters(game, tchalla)).toBe(0);
    cast(game, toHand(game, "Vibranium Mining Mech")); // {4}
    expect(counters(game, tchalla)).toBe(2);
  });

  it("makes a tapped Vibranium token as it enters", () => {
    const { game } = table();
    enter(game, "T'Challa, the Black Panther");
    const [token] = named(game, "Vibranium Token", A);
    expect(token).toBeDefined();
    expect(game.state.objects[token].tapped).toBe(true);
  });
});

describe("Bushmaster, Coiled Henchman", () => {
  it("gives deathtouch to your other creatures with a +1/+1 counter only", () => {
    const { game } = table();
    spawn(game, "Bushmaster, Coiled Henchman");
    const countered = spawn(game, "Grizzly Bears");
    game.state.objects[countered].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    expect(keywords(game, countered).has("deathtouch")).toBe(true);
    expect(keywords(game, plain).has("deathtouch")).toBe(false);
    expect(keywords(game, theirs).has("deathtouch")).toBe(false);
  });
});

describe("King Solomon's Frogs", () => {
  it("cast, exiles up to one mana-value-3+ permanent per opponent and each one's controller draws", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 4);
    const bobsGiant = spawn(game, "Hill Giant", B);
    const carolsBears = spawn(game, "Grizzly Bears", C);
    const carolsGiant = spawn(game, "Hill Giant", C);
    const mine = spawn(game, "Hill Giant");
    const before = { a: hand(game, A).length, b: hand(game, B).length, c: hand(game, C).length };
    // Bob's slot takes his Giant; Carol's is declined.
    const seen = watchTargets(a, (offered) => offered.map((slot) => (slot.includes(bobsGiant) ? bobsGiant : null)));
    cast(game, toHand(game, "King Solomon's Frogs"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual([bobsGiant]);
    expect(seen.offered[1]).toEqual([carolsGiant]);
    expect(seen.offered.flat()).not.toContain(carolsBears);
    expect(seen.offered.flat()).not.toContain(mine);
    expect(zone(game, bobsGiant)).toBe("exile");
    expect(zone(game, carolsGiant)).toBe("battlefield");
    expect(hand(game, B)).toHaveLength(before.b + 1);
    expect(hand(game, C)).toHaveLength(before.c);
    // Alice cast the Frogs from her hand: one card fewer, nothing drawn.
    expect(hand(game, A)).toHaveLength(before.a);
  });

  it("does nothing as it enters if you didn't cast it", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant", B);
    const seen = watchTargets(a);
    enter(game, "King Solomon's Frogs");
    expect(seen.asked).toBe(0);
  });

  it("exiles itself to make you the monarch", () => {
    const { game } = table();
    const frogs = spawn(game, "King Solomon's Frogs");
    lands(game, "Plains", 3);
    activate(game, frogs, 0);
    expect(zone(game, frogs)).toBe("exile");
    expect(game.state.monarch).toBe(A);
  });
});

describe("Dora Milaje Elite", () => {
  it("makes a Vibranium token only if an opponent controls more lands", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Wastes", 2, B);
    enter(game, "Dora Milaje Elite");
    expect(named(game, "Vibranium Token", A)).toHaveLength(0);
    lands(game, "Wastes", 1, B);
    enter(game, "Dora Milaje Elite");
    expect(named(game, "Vibranium Token", A)).toHaveLength(1);
  });

  it("sacrificed, gives your legendary permanents indestructible", () => {
    const { game } = table();
    const dora = spawn(game, "Dora Milaje Elite");
    const legend = spawn(game, "Bushmaster, Coiled Henchman");
    const plain = spawn(game, "Grizzly Bears");
    activate(game, dora, 0);
    expect(zone(game, dora)).toBe("graveyard");
    expect(keywords(game, legend).has("indestructible")).toBe(true);
    expect(keywords(game, plain).has("indestructible")).toBe(false);
  });
});

describe("Iron Man, Modern Marvel", () => {
  it("draws on attack only while you control another artifact creature", () => {
    const { game, a } = table();
    const ironMan = spawn(game, "Iron Man, Modern Marvel");
    const cards = hand(game, A).length;
    attack(game, a, [ironMan]);
    expect(hand(game, A)).toHaveLength(cards);

    nextTurn(game);
    nextTurn(game);
    const chief = spawn(game, "Chief of the Foundry");
    // Chief's own anthem and Iron Man's on each other.
    expect(pt(game, chief)).toEqual({ power: 3, toughness: 4 });
    const before = hand(game, A).length;
    attack(game, a, [ironMan]);
    expect(hand(game, A)).toHaveLength(before + 1);
  });
});

describe("M.O.D.O.K., Evil Intellect", () => {
  it("on your second draw of the turn, the target opponent sacrifices a nontoken creature", () => {
    const { game } = table();
    spawn(game, "M.O.D.O.K., Evil Intellect");
    const bears = spawn(game, "Grizzly Bears", B);
    const soldier = spawn(game, "Soldier Token", B);
    // Alice drew for the turn already: whichever of these is her second
    // card fires it, once.
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[soldier]?.zone).toBe("battlefield");
  });
});

describe("Captain Marvel, Shooting Star", () => {
  it("entering, exiles a creature: its controller gains its power, and so do you", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B); // 3/3
    pickTargets(a, giant);
    enter(game, "Captain Marvel, Shooting Star");
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, B)).toBe(23);
    expect(life(game, A)).toBe(23);
  });

  it("gains life for another creature exiled from the battlefield, not for one that dies", () => {
    const { game } = table();
    spawn(game, "Captain Marvel, Shooting Star");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(life(game, A)).toBe(20);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(giant)]);
    settle(game);
    expect(life(game, A)).toBe(23);
  });
});

describe("Shuri, the Black Panther", () => {
  it("with three artifacts draws; with six also pumps your creatures", () => {
    const { game, a } = table();
    const shuri = spawn(game, "Shuri, the Black Panther");
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i += 1) spawn(game, "Vibranium Token");
    let cards = hand(game, A).length;
    attack(game, a, [shuri]);
    expect(hand(game, A)).toHaveLength(cards + 1);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });

    nextTurn(game);
    nextTurn(game);
    for (let i = 0; i < 3; i += 1) spawn(game, "Vibranium Token");
    cards = hand(game, A).length;
    attack(game, a, [shuri]);
    expect(hand(game, A)).toHaveLength(cards + 1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, shuri)).toEqual({ power: 4, toughness: 5 });
  });
});

describe("Iron Man, Futurist Paragon", () => {
  it("makes a noncreature artifact a 5/5 flying artifact creature for good", () => {
    const { game, a } = table();
    spawn(game, "Iron Man, Futurist Paragon");
    const token = spawn(game, "Vibranium Token");
    pickTargets(a, token);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, token)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, token)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, token).has("flying")).toBe(true);
    nextTurn(game);
    expect(pt(game, token)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, token).has("flying")).toBe(true);
  });

  it("sets a creature's base power and toughness, under its counters", () => {
    const { game, a } = table();
    spawn(game, "Iron Man, Futurist Paragon");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(types(game, bears)).toContain("artifact");
  });
});

describe("Shang-Chi, Martial Mentor", () => {
  it("doubles counters put on himself once he's on the battlefield (his power-up's three become six)", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const shang = spawn(game, "Shang-Chi, Martial Mentor");
    activate(game, shang);
    expect(counters(game, shang)).toBe(6);
  });

  it("a doubler doesn't double the counters it enters with (rule 614.12), but does another creature's", () => {
    const { game } = table();
    spawn(game, "Corpsejack Menace");
    const hydra = enter(game, "Kalonian Hydra");
    expect(counters(game, hydra)).toBe(8);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [
      { kind: "object", object: named(game, "Corpsejack Menace")[0] },
    ]);
    settle(game);
    const copy = named(game, "Corpsejack Menace").find((id) => game.state.objects[id].isToken === true)!;
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [
      { kind: "object", object: copy },
    ]);
    // Two Corpsejacks now: four times one.
    expect(counters(game, copy)).toBe(4);
  });
});
