/**
 * March of the Machine (MOM), batch 1, group d (2026-10-17). Each test is
 * written from the card's Oracle text and rulings, on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,

  keywords,
  lands,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Rashmi and Ragavan", () => {
  it("on your first spell: exiles the opponent's top card, makes a Treasure, and offers it free when its mana value is less than your artifacts", () => {
    const { game, a } = table();
    spawn(game, "Rashmi and Ragavan");
    spawn(game, "Sol Ring");
    const bolt = toLibrary(game, "Lightning Bolt", B);
    lands(game, "Forest", 2);
    let offered: readonly string[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards;
      const way = offer.casts.find((c) => c.card === bolt);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: way.via, free: true };
    };
    pickTargets(a, B);
    // Sol Ring and the new Treasure: two artifacts, so a mana value 1 spell is offered.
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(offered).toContain(bolt);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
  });

  it("not cast free (mana value too high), the card may still be cast this turn by paying for it; the second spell doesn't trigger", () => {
    const { game, a } = table();
    spawn(game, "Rashmi and Ragavan");
    const bolt = toLibrary(game, "Lightning Bolt", B);
    lands(game, "Forest", 4);
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    pickTargets(a, B);
    // Only the Treasure: one artifact, and Lightning Bolt's mana value 1 isn't less than 1.
    cast(game, toHand(game, "Grizzly Bears"));
    expect(asked).toBe(0);
    expect(zone(game, bolt)).toBe("exile");
    // Cast it from exile, paying {R} with the Treasure.
    const castable = game
      .legalActions(A)
      .some((o) => o.kind === "cast-spell" && o.card === bolt);
    expect(castable).toBe(true);
    const next = toLibrary(game, "Lightning Bolt", B);
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "impulse" });
    settle(game);
    expect(game.state.players[B].life).toBe(17);
    // That was the second spell this turn: nothing more exiled.
    expect(zone(game, next)).toBe("library");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Norn's Inquisitor", () => {
  it("incubates 2, and a permanent you control transforming into a Phyrexian gets a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Norn's Inquisitor"));
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(2);
    activate(game, incubator, 0);
    expect(printedCardName(game.state.objects[incubator])).toBe("Phyrexian Token");
    expect(counters(game, incubator)).toBe(3);
  });

  it("doesn't count an opponent's permanent transforming", () => {
    const { game } = table();
    spawn(game, "Norn's Inquisitor");
    const order = spawn(game, "Order of the Mirror", B);
    game.debugApplyEffect(B, { kind: "transform", target: 0 }, [ref(order)]);
    settle(game);
    expect(printedCardName(game.state.objects[order])).toBe("Order of the Alabaster Host");
    expect(counters(game, order)).toBe(0);
  });
});

describe("Compleated Huntmaster", () => {
  it("sacrifices another creature or artifact to incubate 3, never itself", () => {
    const { game } = table();
    const huntmaster = spawn(game, "Compleated Huntmaster");
    lands(game, "Swamp", 1);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === huntmaster)).toBe(false);
    const ring = spawn(game, "Sol Ring");
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === huntmaster);
    expect(offer?.kind === "activate-ability" ? offer.sacrifice?.choices : undefined).toEqual([ring]);
    game.dispatch({ type: "activate-ability", player: A, source: huntmaster, abilityIndex: 0, targets: [], sacrifice: ring });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, huntmaster)).toBe("battlefield");
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(3);
  });
});

describe("Scrappy Bruiser", () => {
  it("pumps another attacker +2/+0 with trample and returns it to its owner's hand at end of combat", () => {
    const { game, a } = table();
    const bruiser = spawn(game, "Scrappy Bruiser");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.declareAttackersFn = () => [
      { attacker: bruiser, defender: B },
      { attacker: bears, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    settle(game);
    expect(game.state.players[B].life).toBe(13);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bruiser)).toBe("battlefield");
  });
});

describe("Lithomantic Barrage", () => {
  it("deals 5 to a white and/or blue target and 1 to any other", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Lithomantic Barrage"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Lithomantic Barrage"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });
});

describe("Seedpod Caretaker", () => {
  it("can transform target Incubator token you control", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "incubate", amount: 2 });
    settle(game);
    const [incubator] = named(game, "Incubator Token", A);
    pickModes(a, 1);
    pickTargets(a, incubator);
    enter(game, "Seedpod Caretaker");
    expect(types(game, incubator)).toEqual(["artifact", "creature"]);
    expect(pt(game, incubator)).toEqual({ power: 2, toughness: 2 });
  });

  it("or puts a +1/+1 counter on target artifact or creature you control", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    pickModes(a, 0);
    pickTargets(a, ring);
    enter(game, "Seedpod Caretaker");
    expect(counters(game, ring)).toBe(1);
  });
});

describe("Blightreaper Thallid // Blightsower Thallid", () => {
  it("makes a Phyrexian Saproling when it transforms into Blightsower Thallid, and another when it dies", () => {
    const { game } = table();
    const thallid = spawn(game, "Blightreaper Thallid");
    lands(game, "Forest", 4);
    activate(game, thallid, 0);
    expect(printedCardName(game.state.objects[thallid])).toBe("Blightsower Thallid");
    expect(tokensNamed(game, "Phyrexian Saproling Token", A)).toBe(1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(thallid)]);
    settle(game);
    expect(tokensNamed(game, "Phyrexian Saproling Token", A)).toBe(2);
  });

  it("the front face dying makes nothing", () => {
    const { game } = table();
    const thallid = spawn(game, "Blightreaper Thallid");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(thallid)]);
    settle(game);
    expect(tokensNamed(game, "Phyrexian Saproling Token", A)).toBe(0);
  });
});

describe("Protocol Knight", () => {
  it("taps the target, and stuns it only if you control another Knight", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Protocol Knight");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(0);

    const { game: g2, a: a2 } = table();
    spawn(g2, "Marshal of Zhalfir");
    const giant2 = spawn(g2, "Hill Giant", B);
    pickTargets(a2, giant2);
    enter(g2, "Protocol Knight");
    expect(g2.state.objects[giant2].tapped).toBe(true);
    expect(counters(g2, giant2, "stun")).toBe(1);
  });
});

describe("Failed Conversion", () => {
  it("gives -4/-4, and when the enchanted creature dies its controller surveils 2", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Grizzly Bears")];
    let looked: readonly string[] = [];
    a.chooseScryFn = (_view, cards) => {
      looked = cards;
      return cards;
    };
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Failed Conversion"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(looked).toHaveLength(2);
    for (const id of top) expect(graveyard(game)).toContain(id);
  });
});

describe("Order of the Alabaster Host", () => {
  it("each creature blocking it gets -1/-1 until end of turn", () => {
    const { game, a, b } = table();
    const order = spawn(game, "Order of the Mirror");
    lands(game, "Plains", 4);
    activate(game, order, 0);
    expect(printedCardName(game.state.objects[order])).toBe("Order of the Alabaster Host");
    const elf = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = () => [{ blocker: elf, attacker: order }];
    attack(game, a, [order]);
    expect(zone(game, elf)).toBe("graveyard");
    expect(game.state.objects[order].damageMarked).toBe(0);
  });
});
