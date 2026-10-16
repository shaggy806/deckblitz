/**
 * Set walk batch 85, part a (2026-10-15): Foundations Jumpstart (J25), Duskmourn: House of Horror Commander (DSC) and Duskmourn: House of Horror (DSK), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
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
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Psemilla, Meletian Poet", () => {
  it("makes a Nymph for the first enchantment spell each turn only", () => {
    const { game } = table();
    spawn(game, "Psemilla, Meletian Poet");
    lands(game, "Island", 6);
    cast(game, toHand(game, "Rhystic Study"));
    expect(tokensNamed(game, "Nymph Token")).toBe(1);
    cast(game, toHand(game, "Rhystic Study"));
    expect(tokensNamed(game, "Nymph Token")).toBe(1);
  });

  it("gets +4/+4 and lifelink at the beginning of combat only with five enchantments", () => {
    const { game } = table();
    const poet = spawn(game, "Psemilla, Meletian Poet");
    for (let i = 0; i < 4; i += 1) spawn(game, "Rhystic Study");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, poet)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Rhystic Study");
    nextTurn(game, "begin-combat");
    settle(game);
    // Bob's combat too: "each combat".
    expect(pt(game, poet)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, poet).has("lifelink")).toBe(true);
  });
});

describe("Thurid, Mare of Destiny", () => {
  it("copies a Horse creature spell, and other Horses get +1/+1", () => {
    const { game } = table();
    const thurid = spawn(game, "Thurid, Mare of Destiny");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Armored Warhorse"));
    const horses = named(game, "Armored Warhorse");
    expect(horses.length).toBe(2);
    expect(tokensNamed(game, "Armored Warhorse")).toBe(1);
    for (const horse of horses) expect(pt(game, horse)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, thurid)).toEqual({ power: 2, toughness: 4 });
  });

  it("doesn't copy a non-Horse creature spell", () => {
    const { game } = table();
    spawn(game, "Thurid, Mare of Destiny");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears").length).toBe(1);
  });
});

describe("Gilded Scuttler", () => {
  it("taps an opponent's creature and stuns it; it can't be blocked", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    const crab = toHand(game, "Gilded Scuttler");
    cast(game, crab);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
    expect(keywords(game, crab).has("unblockable")).toBe(true);
  });
});

describe("Pol Jamaar, Illusionist", () => {
  it("draws a card for each creature you control of the chosen type", () => {
    const { game, a } = table();
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves", B);
    a.chooseCreatureTypeFn = () => "Elf";
    const before = hand(game).length;
    enter(game, "Pol Jamaar, Illusionist");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Sandstorm Crasher", () => {
  it("exerted, makes a tapped and attacking token copy of a creature you control, sacrificed at the end step", () => {
    const { game, a } = table();
    const crasher = spawn(game, "Sandstorm Crasher");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [crasher]);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(1);
    // 3 from the Crasher, 2 from the token copy that entered attacking.
    expect(life(game, B)).toBe(15);
    expect(game.state.objects[crasher].exertedBy).toBe(A);
    nextTurn(game);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("does nothing when not exerted", () => {
    const { game, a } = table();
    const crasher = spawn(game, "Sandstorm Crasher");
    spawn(game, "Grizzly Bears");
    pickModes(a);
    attack(game, a, [crasher]);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
    expect(life(game, B)).toBe(17);
  });
});

describe("Anep, Vizier of Hazoret", () => {
  it("exerted, exiles the top two cards of your library to play", () => {
    const { game, a } = table();
    const anep = spawn(game, "Anep, Vizier of Hazoret");
    const second = toLibrary(game, "Grizzly Bears");
    const top = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [anep]);
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    expect(game.state.objects[top].impulse?.player).toBe(A);
    lands(game, "Forest", 2);
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
  });
});

describe("Hurska Sweet-Tooth", () => {
  it("makes a Food as it attacks", () => {
    const { game, a } = table();
    const hurska = spawn(game, "Hurska Sweet-Tooth");
    attack(game, a, [hurska]);
    expect(tokensNamed(game, "Food Token")).toBe(1);
  });

  it("pays {G/W} on life gain to give target creature +X/+X, X the life gained", () => {
    const { game, a } = table();
    spawn(game, "Hurska Sweet-Tooth");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    pickModes(a, 0);
    pickTargets(a, bears);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("does nothing when the cost isn't paid", () => {
    const { game, a } = table();
    spawn(game, "Hurska Sweet-Tooth");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    pickModes(a);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Eidolon of Astral Winds", () => {
  it("on itself or another enchantment entering, a creature you control has base 4/4 and flying until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    lands(game, "Plains", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "Eidolon of Astral Winds"));
    // Base 4/4, the counter on top (the ruling).
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("triggers on another enchantment entering", () => {
    const { game, a } = table();
    spawn(game, "Eidolon of Astral Winds");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Rhystic Study");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Delightful Discovery", () => {
  it("costs {1} less for each spell your opponents have cast this turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    game.state.players[B].spellsCastThisTurn = 2;
    const before = hand(game).length;
    cast(game, toHand(game, "Delightful Discovery"));
    expect(hand(game).length).toBe(before + 2);
  });

  it("isn't cheaper for your own spells", () => {
    const { game } = table();
    lands(game, "Island", 3);
    game.state.players[A].spellsCastThisTurn = 2;
    expect(() => cast(game, toHand(game, "Delightful Discovery"))).toThrow();
  });
});

describe("Nazar, the Velvet Fang", () => {
  it("gets a feeding counter per life gain, and may spend three as it attacks to draw three and lose 3", () => {
    const { game, a } = table();
    const nazar = spawn(game, "Nazar, the Velvet Fang");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(counters(game, nazar, "feeding")).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "feeding", amount: 2 }, [ref(nazar)]);
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [nazar]);
    expect(counters(game, nazar, "feeding")).toBe(0);
    expect(hand(game).length).toBe(before + 3);
    expect(life(game)).toBe(18);
  });

  it("can't with fewer than three", () => {
    const { game, a } = table();
    const nazar = spawn(game, "Nazar, the Velvet Fang");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "feeding", amount: 2 }, [ref(nazar)]);
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [nazar]);
    expect(counters(game, nazar, "feeding")).toBe(2);
    expect(hand(game).length).toBe(before);
  });
});

describe("Phantasmal Shieldback", () => {
  it("is sacrificed when targeted, and draws a card as it dies", () => {
    const { game } = table();
    const turtle = spawn(game, "Phantasmal Shieldback");
    lands(game, "Forest", 1);
    const growth = toHand(game, "Giant Growth");
    const before = hand(game).length;
    cast(game, growth, { targets: [ref(turtle)] });
    expect(zone(game, turtle)).toBe("graveyard");
    // Giant Growth left the hand, a card was drawn.
    expect(hand(game).length).toBe(before);
  });
});

describe("Scourge of the Undercity", () => {
  it("gives another creature you control lifelink until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Scourge of the Undercity"));
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Cleon, Merry Champion", () => {
  it("heroic: a spell you cast targeting it exiles the top card to play", () => {
    const { game } = table();
    const cleon = spawn(game, "Cleon, Merry Champion");
    const top = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(cleon)] });
    expect(zone(game, top)).toBe("exile");
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
  });

  it("not for a spell targeting something else", () => {
    const { game } = table();
    spawn(game, "Cleon, Merry Champion");
    const bears = spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(zone(game, top)).toBe("library");
  });
});

describe("Revoke Demise", () => {
  it("costs {2} less targeting a creature card with mana value 3 or less, and gains 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Revoke Demise"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game)).toBe(22);
  });

  it("costs full price for a bigger creature card", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const wurm = toGraveyard(game, "Craw Wurm");
    expect(() => cast(game, toHand(game, "Revoke Demise"), { targets: [ref(wurm)] })).toThrow();
  });
});

describe("Slimy Piper", () => {
  it("gets +1/+1 attacking with fewer than four creatures", () => {
    const { game, a } = table();
    const piper = spawn(game, "Slimy Piper");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    attack(game, a, [piper]);
    expect(pt(game, piper)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, piper).has("indestructible")).toBe(false);
  });

  it("gets +2/+2 and indestructible instead with four, counting itself", () => {
    const { game, a } = table();
    const piper = spawn(game, "Slimy Piper");
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears");
    attack(game, a, [piper]);
    expect(pt(game, piper)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, piper).has("indestructible")).toBe(true);
  });
});

describe("Saurian Symbiote", () => {
  it("puts a +1/+1 counter on itself", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const symbiote = enter(game, "Saurian Symbiote");
    expect(counters(game, symbiote)).toBe(1);
    expect(tokensNamed(game, "Saproling Token")).toBe(0);
  });

  it("or makes a Saproling", () => {
    const { game, a } = table();
    pickModes(a, 1);
    const symbiote = enter(game, "Saurian Symbiote");
    expect(counters(game, symbiote)).toBe(0);
    expect(tokensNamed(game, "Saproling Token")).toBe(1);
  });
});

describe("Spined Tyrranax", () => {
  it("pays {2}{G} at the beginning of combat for a +1/+1 counter and trample on target creature", () => {
    const { game, a } = table();
    spawn(game, "Spined Tyrranax");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    pickModes(a, 0);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Hearts on Fire", () => {
  it("gives one or two target creatures +2/+1", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Hearts on Fire"), { targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, two)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Razorgrass Invoker", () => {
  it("pumps itself and up to one other target creature", () => {
    const { game } = table();
    const invoker = spawn(game, "Razorgrass Invoker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 16);
    activate(game, invoker, 0, { targets: [ref(bears)] });
    expect(pt(game, invoker)).toEqual({ power: 7, toughness: 6 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    activate(game, invoker, 0, { targets: [null] });
    expect(pt(game, invoker)).toEqual({ power: 10, toughness: 9 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("does nothing, to itself too, when its target goes away", () => {
    const { game } = table();
    const invoker = spawn(game, "Razorgrass Invoker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 8);
    activate(game, invoker, 0, { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(pt(game, invoker)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Faithful Pikemaster", () => {
  it("has first strike only on your turn", () => {
    const { game } = table();
    const pikemaster = enter(game, "Faithful Pikemaster");
    expect(keywords(game, pikemaster).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, pikemaster).has("first-strike")).toBe(false);
  });
});

describe("Razorkin Hordecaller", () => {
  it("makes a 1/1 red Gremlin whenever you attack", () => {
    const { game, a } = table();
    const hordecaller = spawn(game, "Razorkin Hordecaller");
    attack(game, a, [hordecaller]);
    expect(tokensNamed(game, "Gremlin Token", A)).toBe(1);
  });
});
