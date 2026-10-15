/**
 * Reality Fracture (FRA and FRC), batch 3, part a (2026-10-14): the bottom half of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
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
  zone,
} from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("Theorix Charm", () => {
  it("mills three cards, then draws a card", () => {
    const { game } = table();
    lands(game, "Underground Sea", 2);
    const charm = toHand(game, "Theorix Charm");
    const handBefore = hand(game).length;
    cast(game, charm, { modes: [2] });
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(3);
    // The charm left the hand, the draw replaced it.
    expect(hand(game)).toHaveLength(handBefore);
  });
});

describe("Darklight Phoenix", () => {
  it("returns from the graveyard at the beginning of combat on your turn only if two or more creatures died this turn", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, "Darklight Phoenix");
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, phoenix)).toBe("graveyard");

    toStep(game, "precombat-main"); // the next turn of alice's
    destroy(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Grizzly Bears", A));
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(controller(game, phoenix)).toBe(A);
  });
});

describe("Vindictive Triumph", () => {
  it("steals a permanent with mana value 3 or less tapped, then exiles it at the next end step", () => {
    const { game } = table();
    lands(game, "Scrubland", 1);
    lands(game, "Swamp", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Vindictive Triumph"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("battlefield");
    expect(controller(game, bear)).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bear)).toBe("exile");
  });

  it("leaves a stolen permanent that left and came back since (a new object, rule 400.7)", () => {
    const { game } = table();
    lands(game, "Scrubland", 1);
    lands(game, "Swamp", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Vindictive Triumph"), { targets: [ref(bear)] });
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(bear)]);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("only exiles a permanent with mana value 4 or more", () => {
    const { game } = table();
    lands(game, "Scrubland", 1);
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Vindictive Triumph"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(game.state.zones.shared.battlefield.filter((id) => controller(game, id) === A && game.state.objects[id].cardName === "Serra Angel")).toHaveLength(0);
  });
});

describe("Hunter's Axe", () => {
  it("gives the equipped creature +2/+0 and, as it attacks, its controller's choice of trample or deathtouch", () => {
    const { game, a } = table();
    const axe = spawn(game, "Hunter's Axe");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    activate(game, axe, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    pickModes(a, 1);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(keywords(game, bear).has("deathtouch")).toBe(true);
    expect(keywords(game, bear).has("trample")).toBe(false);
  });
});

describe("Traxos, Academy Guardian", () => {
  it("costs {2} less once you've cast a noncreature spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const traxos = toHand(game, "Traxos, Academy Guardian");
    expect(castOffers(game, traxos)).toHaveLength(0);
    cast(game, toHand(game, "Opt"));
    // Two Islands left: {1}{U}.
    expect(castOffers(game, traxos).length).toBeGreaterThan(0);
    cast(game, traxos);
    expect(zone(game, traxos)).toBe("battlefield");
  });
});

describe("Yoshimaru, Scrappy Stray", () => {
  it("has another creature you control fight up to one creature an opponent controls", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant, bear);
    enter(game, "Yoshimaru, Scrappy Stray");
    expect(zone(game, bear)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("does nothing when no opposing creature is chosen", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant, null);
    enter(game, "Yoshimaru, Scrappy Stray");
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });
});

describe("Silence the Echo", () => {
  it("offers sacrificing a planeswalker as its additional cost, and paying {3} instead", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 3;
    const victim = spawn(game, "Hill Giant", B);
    const silence = toHand(game, "Silence the Echo");
    const texts = () =>
      castOffers(game, silence)
        .map((o) => (o.kind === "cast-spell" ? o.costOptionText : null))
        .sort();
    expect(texts()).toEqual(["Sacrifice a creature or planeswalker"]);
    lands(game, "Swamp", 3);
    expect(texts()).toEqual(["Pay {3}", "Sacrifice a creature or planeswalker"]);
    cast(game, silence, { targets: [ref(victim)], costOption: 1 });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, jace)).toBe("battlefield");
  });
});

describe("Twisted Fates", () => {
  it("destroys the permanent and puts a counter on each creature the target player controls", () => {
    const { game } = table();
    lands(game, "Scrubland", 3);
    lands(game, "Swamp", 2);
    const relic = spawn(game, "Sol Ring", B);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Twisted Fates"), { targets: [ref(relic), ref(A)] });
    expect(zone(game, relic)).toBe("graveyard");
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Gallia, Tragic Host", () => {
  it("returns from the graveyard tapped with a +1/+1 counter by exiling another creature card", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const gallia = toGraveyard(game, "Gallia, Tragic Host");
    // No other creature card: Gallia can't pay with herself.
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === gallia)).toBe(false);
    const bear = toGraveyard(game, "Grizzly Bears");
    activate(game, gallia, 0);
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, gallia)).toBe("battlefield");
    expect(game.state.objects[gallia].tapped).toBe(true);
    expect(counters(game, gallia)).toBe(1);
  });
});

describe("Mind Meanderer", () => {
  it("has vigilance only while you control a Jace planeswalker", () => {
    const { game } = table();
    const meanderer = spawn(game, "Mind Meanderer");
    expect(keywords(game, meanderer).has("vigilance")).toBe(false);
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 3;
    expect(keywords(game, meanderer).has("vigilance")).toBe(false);
    const mine = spawn(game, "Jace Beleren");
    game.state.objects[mine].counters.loyalty = 3;
    expect(keywords(game, meanderer).has("vigilance")).toBe(true);
  });
});

describe("Jhoira, Weatherlight Corsair", () => {
  it("puts the opponent's first historic permanent card onto the battlefield under your control, and you lose life equal to its mana value", () => {
    const { game, a } = table();
    // Bob's library top down: Opt, Grizzly Bears, Mind Stone, Wastes…
    const stone = toLibrary(game, "Mind Stone", B);
    const bear = toLibrary(game, "Grizzly Bears", B);
    const opt = toLibrary(game, "Opt", B);
    pickTargets(a, B);
    enter(game, "Jhoira, Weatherlight Corsair");
    expect(zone(game, stone)).toBe("battlefield");
    expect(controller(game, stone)).toBe(A);
    expect(life(game)).toBe(18);
    // The rest went to the bottom of bob's library.
    const library = game.state.zones.perPlayer[B].library;
    expect(library.slice(-2).sort()).toEqual([bear, opt].sort());
  });

  it("triggers on attacking too", () => {
    const { game, a } = table();
    const jhoira = spawn(game, "Jhoira, Weatherlight Corsair");
    const ring = toLibrary(game, "Sol Ring", B);
    pickTargets(a, B);
    attack(game, a, [jhoira]);
    expect(controller(game, ring)).toBe(A);
    expect(zone(game, ring)).toBe("battlefield");
    expect(life(game)).toBe(19);
  });

  it("reads the mana value of the permanent it became (a Metamorph copying something)", () => {
    const { game, a } = table();
    spawn(game, "Serra Angel", B);
    const metamorph = toLibrary(game, "Phyrexian Metamorph", B);
    pickTargets(a, B);
    // "You may have it enter as a copy": yes, of Serra Angel (MV 5).
    a.chooseModesFn = () => [0];
    a.choosePermanentsFn = (_v, eligible) => eligible.filter((id) => game.state.objects[id].cardName === "Serra Angel");
    enter(game, "Jhoira, Weatherlight Corsair");
    expect(zone(game, metamorph)).toBe("battlefield");
    expect(controller(game, metamorph)).toBe(A);
    expect(life(game)).toBe(15);
  });
});

describe("Paradox Shaper", () => {
  it("puts a card from your graveyard on the bottom of your library", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const shaper = spawn(game, "Paradox Shaper");
    const bolt = toGraveyard(game, "Lightning Bolt");
    activate(game, shaper, 0, { targets: [ref(bolt)] });
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bolt);
  });
});

describe("Tethermage's Advantage", () => {
  it("pumps, grants reach and untaps the creature", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Tethermage's Advantage"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bear).has("reach")).toBe(true);
    expect(game.state.objects[bear].tapped).toBe(false);
  });
});

describe("Memory Trap", () => {
  it("exiles an opponent's nonland permanent until it leaves, then returns it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const trap = enter(game, "Memory Trap");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, trap);
    settle(game);
    const back = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(controller(game, back!)).toBe(B);
  });
});
