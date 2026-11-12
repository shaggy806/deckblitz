import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { computeCharacteristics } from "../characteristics.js";
import type { EffectSpec } from "../effects.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import type { ScriptedController } from "../controller.js";
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
  pickTargets,
  graveyard,
  lands,
  loyalty,
  life,
  pickModes,
  pt,
  ref,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
  settle,
  spawn,
  table,
  toGraveyard,
  toStep,
} from "./harness.js";

// Mystery Booster Commander Edition's last commanders, each on an engine
// feature built for it.

const apply = (game: Game, player: PlayerId, effect: EffectSpec, source?: ObjectId): void => {
  game.debugApplyEffect(player, effect, [], source === undefined ? {} : { source });
  settle(game);
};
const exiled = (game: Game, player: PlayerId = A): number =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].owner === player).length;

describe("Sahir, Visitor in Darkness", () => {
  it("your effect losing you exactly 1 life grows it; the second time this turn draws too", () => {
    const { game } = table();
    const sahir = spawn(game, "Sahir, Visitor in Darkness");
    const cards = hand(game).length;
    apply(game, A, { kind: "lose-life", amount: 1, who: "you" });
    expect(counters(game, sahir)).toBe(1);
    expect(hand(game).length).toBe(cards);
    // The damage half counts toward the same ability's resolutions.
    apply(game, A, { kind: "damage", amount: 1, who: "you" }, sahir);
    expect(counters(game, sahir)).toBe(2);
    expect(hand(game).length).toBe(cards + 1);
    apply(game, A, { kind: "lose-life", amount: 1, who: "you" });
    expect(counters(game, sahir)).toBe(3);
    expect(hand(game).length).toBe(cards + 1);
  });

  it("not 2 life, not an opponent's effect, not an opponent's source's damage", () => {
    const { game } = table();
    const sahir = spawn(game, "Sahir, Visitor in Darkness");
    apply(game, A, { kind: "lose-life", amount: 2, who: "you" });
    apply(game, B, { kind: "lose-life", amount: 1, who: "each-opponent" });
    const theirs = spawn(game, "Grizzly Bears", B);
    apply(game, B, { kind: "damage", amount: 1, who: "each-opponent" }, theirs);
    expect(life(game)).toBe(16);
    expect(counters(game, sahir)).toBe(0);
  });

  it("eminence: it deals you 1 at your upkeep, which grows it", () => {
    const { game } = table();
    const sahir = spawn(game, "Sahir, Visitor in Darkness");
    // Bob's turn, then Alice's upkeep on the way to her main phase.
    toStep(game, "precombat-main", A);
    expect(life(game)).toBe(19);
    expect(counters(game, sahir)).toBe(1);
  });
});

describe("Glava, Five-Advents Mage", () => {
  it("a permanent spell's X becomes 5, once each turn", () => {
    const { game, a } = table();
    spawn(game, "Glava, Five-Advents Mage");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    const first = toHand(game, "Endless One");
    cast(game, first, { x: 1 });
    expect(counters(game, first)).toBe(5);
    const second = toHand(game, "Endless One");
    cast(game, second, { x: 1 });
    expect(counters(game, second)).toBe(1);
  });

  it("an activated ability's X becomes 5 — the same once a turn as the spells'", () => {
    const { game, a } = table();
    spawn(game, "Glava, Five-Advents Mage");
    const pinnacle = spawn(game, "Helix Pinnacle");
    lands(game, "Wastes", 3);
    pickModes(a, 0);
    activate(game, pinnacle, 0, { x: 1 });
    expect(counters(game, pinnacle, "tower")).toBe(5);
    const one = toHand(game, "Endless One");
    cast(game, one, { x: 1 });
    expect(counters(game, one)).toBe(1);
  });

  it("declining leaves X as it was", () => {
    const { game, a } = table();
    spawn(game, "Glava, Five-Advents Mage");
    lands(game, "Wastes", 2);
    pickModes(a);
    const one = toHand(game, "Endless One");
    cast(game, one, { x: 2 });
    expect(counters(game, one)).toBe(2);
  });
});

describe("The Muckslinger Gang", () => {
  it("other creatures you control get +3/+3, but not while attacking", () => {
    const { game, a } = table();
    const gang = spawn(game, "The Muckslinger Gang");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, gang)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("your creature cards off the battlefield and your creature spells get +3/+3", () => {
    const { game } = table();
    spawn(game, "The Muckslinger Gang");
    const power = (id: ObjectId): number => computeCharacteristics(game.state, game.registry, id).power;
    expect(power(toHand(game, "Grizzly Bears"))).toBe(5);
    expect(power(toGraveyard(game, "Grizzly Bears"))).toBe(5);
    expect(power(toGraveyard(game, "Grizzly Bears", B))).toBe(2);
    // Not a noncreature card.
    expect(computeCharacteristics(game.state, game.registry, toHand(game, "Lightning Bolt")).power).toBe(0);
    lands(game, "Forest", 2);
    const spell = toHand(game, "Grizzly Bears");
    cast(game, spell, { settle: false });
    expect(game.state.objects[spell].zone).toBe("stack");
    expect(power(spell)).toBe(5);
  });

  it("gone, its cards are their own size again", () => {
    const { game } = table();
    const gang = spawn(game, "The Muckslinger Gang");
    const card = toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(gang)]);
    settle(game);
    expect(computeCharacteristics(game.state, game.registry, card).power).toBe(2);
  });
});

describe("The Madcap Jester", () => {
  it("attacking, each opponent exiles their top card, which you may play — spending any mana", () => {
    const { game, a } = table({ players: 3 });
    const jester = spawn(game, "The Madcap Jester");
    const bolt = toLibrary(game, "Lightning Bolt", B);
    const carols = toLibrary(game, "Mountain", C);
    attack(game, a, [jester]);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    // Carol's Mountain is a land play from exile.
    game.dispatch({ type: "play-land", player: A, card: carols });
    settle(game);
    expect(zone(game, carols)).toBe("battlefield");
    // Bob's Bolt, cast with colourless mana (any type can be spent).
    lands(game, "Wastes", 1);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(14);
  });

  it("not a card exiled from an opponent's library outside a spell or ability of yours", () => {
    const { game } = table();
    spawn(game, "The Madcap Jester");
    const top = toLibrary(game, "Mountain", B);
    // An effect applied outside any resolution: no spell or ability caused it.
    apply(game, B, { kind: "exile-from-library", whose: "you", amount: 1 });
    expect(zone(game, top)).toBe("exile");
    expect(() => game.dispatch({ type: "play-land", player: A, card: top })).toThrow();
  });
});

/** The seat casts every free copy offered, aimed at `targets`; records each. */
function castCopies(game: Game, seat: ScriptedController, targets: readonly TargetRef[]): { cast: string[] } {
  const seen = { cast: [] as string[] };
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts[0];
    if (way === undefined) return null;
    seen.cast.push(game.state.objects[way.card]?.cardName ?? "?");
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets, via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

describe("Massimo, the Magician", () => {
  it("an entering creature exiles a 1-drop instant and copies it on combat damage", () => {
    const { game, a } = table();
    spawn(game, "Massimo, the Magician");
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    const bears = enter(game, "Grizzly Bears");
    expect(zone(game, bolt)).toBe("exile");
    const seen = castCopies(game, a, [ref(B)]);
    attack(game, a, [bears]);
    expect(seen.cast).toEqual(["Lightning Bolt"]);
    expect(life(game, B)).toBe(15);
    // The card stays in exile; it was a copy that was cast.
    expect(zone(game, bolt)).toBe("exile");
  });

  it("two grants remember their own two cards", () => {
    const { game, a } = table();
    spawn(game, "Massimo, the Magician");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const shock = toGraveyard(game, "Shock");
    pickTargets(a, bolt);
    const bears = enter(game, "Grizzly Bears");
    pickTargets(a, shock);
    const elves = enter(game, "Llanowar Elves");
    const seen = castCopies(game, a, [ref(B)]);
    attack(game, a, [bears, elves]);
    expect([...seen.cast].sort()).toEqual(["Lightning Bolt", "Shock"]);
    // 2 + 1 combat, 3 + 2 from the copies.
    expect(life(game, B)).toBe(12);
  });

  it("not a card of mana value 2", () => {
    const { game, a } = table();
    spawn(game, "Massimo, the Magician");
    const helix = toGraveyard(game, "Lightning Helix");
    pickTargets(a, helix);
    enter(game, "Grizzly Bears");
    expect(zone(game, helix)).toBe("graveyard");
  });
});

describe("Chira, All In", () => {
  const grew = (game: Game, chira: ObjectId): { counters: number; treasures: number } => ({
    counters: counters(game, chira),
    treasures: tokensNamed(game, "Treasure Token", A),
  });

  it("three coins flipped at once is one flip; two dice rolled is one roll", () => {
    const { game } = table();
    const chira = spawn(game, "Chira, All In");
    apply(game, A, { kind: "flip-coin", count: 3 });
    expect(grew(game, chira)).toEqual({ counters: 1, treasures: 1 });
    apply(game, A, { kind: "roll-dice", sides: 6, count: 2 });
    expect(grew(game, chira)).toEqual({ counters: 2, treasures: 2 });
    const treasure = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Treasure Token");
    expect(game.state.objects[treasure!].tapped).toBe(true);
  });

  it("discarding at random and choosing a mode at random", () => {
    const { game } = table();
    const chira = spawn(game, "Chira, All In");
    toHand(game, "Grizzly Bears");
    apply(game, A, { kind: "discard", target: "you", amount: 1, random: true });
    expect(grew(game, chira).counters).toBe(1);
    // A chosen discard isn't at random.
    toHand(game, "Grizzly Bears");
    apply(game, A, {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      random: true,
      modes: [
        { text: "Gain 1 life.", effect: { kind: "gain-life", amount: 1 } },
        { text: "Gain 2 life.", effect: { kind: "gain-life", amount: 2 } },
      ],
    });
    expect(grew(game, chira).counters).toBe(2);
  });

  it("targets selected at random (Goblin Test Pilot)", () => {
    const { game } = table();
    const chira = spawn(game, "Chira, All In");
    const pilot = spawn(game, "Goblin Test Pilot");
    activate(game, pilot);
    expect(grew(game, chira).counters).toBe(1);
  });

  it("not an opponent's flip, nor a discard of your choosing", () => {
    const { game } = table();
    const chira = spawn(game, "Chira, All In");
    apply(game, B, { kind: "flip-coin", count: 1 });
    toHand(game, "Grizzly Bears");
    apply(game, A, { kind: "discard", target: "you", amount: 1 });
    expect(grew(game, chira)).toEqual({ counters: 0, treasures: 0 });
  });
});

describe("The Unluckiest Planeswalker", () => {
  it("−3: discard, draw twice your Auras, and move each Aura on you to an opponent", () => {
    const { game } = table();
    const walker = spawn(game, "The Unluckiest Planeswalker");
    const curse = spawn(game, "Curse of Bloodletting");
    game.state.objects[curse].attachedToPlayer = A;
    toHand(game, "Grizzly Bears");
    loyalty(game, walker, -3, { atLeast: 4 });
    expect(game.state.objects[curse].attachedToPlayer).toBe(B);
    // One Aura you control: the hand of one went, two came.
    expect(hand(game).length).toBe(2);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });

  it("−3 with three players: each Aura goes to the opponent chosen for it", () => {
    const { game, a } = table({ players: 3 });
    const walker = spawn(game, "The Unluckiest Planeswalker");
    const curse = spawn(game, "Curse of Bloodletting");
    game.state.objects[curse].attachedToPlayer = A;
    pickModes(a, 1);
    loyalty(game, walker, -3, { atLeast: 4 });
    expect(game.state.objects[curse].attachedToPlayer).toBe(C);
  });

  it("+1: its mana spent on an Aura spell makes a Gremlin", () => {
    const { game, a } = table();
    const walker = spawn(game, "The Unluckiest Planeswalker");
    const bears = spawn(game, "Grizzly Bears");
    // The colour is asked as modes, W U B R G.
    pickModes(a, 4);
    loyalty(game, walker, 1);
    cast(game, toHand(game, "Rancor"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Gremlin Token", A)).toBe(1);
  });
});

describe("Itazura, Lingering Wick", () => {
  it("the highest number is dealt that much and casts one free; you take one of the rest", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Itazura, Lingering Wick");
    const island = toLibrary(game, "Island");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    b.chooseNumberFn = () => 3;
    c.chooseNumberFn = () => 1;
    b.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((w) => w.card === bears);
      return way === undefined ? null : { type: "cast-spell", player: B, card: bears, targets: [], via: way.via, free: true };
    };
    toStep(game, "upkeep", A);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    // One of the other two is yours, the other stays in exile.
    const kept = [island, bolt].filter((id) => zone(game, id) === "hand");
    expect(kept).toHaveLength(1);
    expect([island, bolt].filter((id) => zone(game, id) === "exile")).toHaveLength(1);
  });

  it("a declined cast leaves all three to choose from", () => {
    const { game, b } = table();
    spawn(game, "Itazura, Lingering Wick");
    const cards = [toLibrary(game, "Island"), toLibrary(game, "Forest"), toLibrary(game, "Plains")];
    b.chooseNumberFn = () => 0;
    b.chooseCastNowFn = () => null;
    toStep(game, "upkeep", A);
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(cards.filter((id) => zone(game, id) === "hand")).toHaveLength(1);
    expect(cards.filter((id) => zone(game, id) === "exile")).toHaveLength(2);
  });
});

describe("Yume, Chronicler of Valor", () => {
  const assistOffers = (game: Game, card: ObjectId): (PlayerId | undefined)[] =>
    game
      .legalActions(A)
      .filter((a): a is Extract<typeof a, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card)
      .map((a) => a.assist);

  it("your first spell on your turn has assist; when another player helps, you both draw", () => {
    const { game } = table();
    spawn(game, "Yume, Chronicler of Valor");
    lands(game, "Forest", 1);
    lands(game, "Island", 3, B);
    const bears = toHand(game, "Grizzly Bears");
    expect(assistOffers(game, bears)).toContain(B);
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    cast(game, bears, { assist: B, settle: false });
    game.dispatch({ type: "choose-number", player: B, number: 1 });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].assistedBy).toBe(B);
    // The Bears left hand; Yume's trigger drew one back, and Bob one.
    expect(hand(game).length).toBe(mine);
    expect(hand(game, B).length).toBe(theirs + 1);
  });

  it("no help, no draw; and the second spell has no assist", () => {
    const { game } = table();
    spawn(game, "Yume, Chronicler of Valor");
    lands(game, "Forest", 4);
    lands(game, "Island", 3, B);
    const first = toHand(game, "Grizzly Bears");
    const theirs = hand(game, B).length;
    cast(game, first);
    expect(hand(game, B).length).toBe(theirs);
    const second = toHand(game, "Grizzly Bears");
    expect(assistOffers(game, second)).not.toContain(B);
  });

  it("not on an opponent's turn", () => {
    const { game } = table();
    spawn(game, "Yume, Chronicler of Valor");
    lands(game, "Island", 3, B);
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    toStep(game, "upkeep", B);
    expect(assistOffers(game, bolt)).not.toContain(B);
  });
});

describe("Matoc, Lavamancer", () => {
  it("its own 2 damage to a player exiles the top card", () => {
    const { game } = table();
    const matoc = spawn(game, "Matoc, Lavamancer");
    spawn(game, "Mountain");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes");
    activate(game, matoc, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    // Two from the graveyard for the cost, one off the top for the trigger.
    expect(exiled(game)).toBe(3);
  });

  it("2 to each of two opponents at once triggers it once", () => {
    const { game } = table({ players: 3 });
    const matoc = spawn(game, "Matoc, Lavamancer");
    apply(game, A, { kind: "damage", amount: 2, who: "each-opponent" }, matoc);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(exiled(game)).toBe(1);
  });

  it("no recipient dealt exactly 2, no trigger; a source an opponent controls doesn't count", () => {
    const { game } = table();
    const matoc = spawn(game, "Matoc, Lavamancer");
    apply(game, A, { kind: "damage", amount: 3, who: "each-opponent" }, matoc);
    expect(exiled(game)).toBe(0);
    const theirs = spawn(game, "Grizzly Bears", B);
    apply(game, B, { kind: "damage", amount: 2, who: "each-opponent" }, theirs);
    expect(life(game)).toBe(18);
    expect(exiled(game)).toBe(0);
  });
});
