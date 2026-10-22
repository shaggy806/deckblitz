/**
 * Aether Revolt, group T (and the "discard any number" rechecks) — the clause
 * of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  type BlockOffer,
  activate,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
  ref,
  registryOf,
  spawn,
  table,
  tokensNamed,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Oath of Ajani", () => {
  it("puts a counter on each of your creatures and makes planeswalker spells cost {1} less", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Oath of Ajani");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
    toStep(game, "precombat-main");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 3);
    const ajani = toHand(game, "Ajani Unyielding");
    cast(game, ajani); // {4}{G}{W} paid with five lands
    expect(zone(game, ajani)).toBe("battlefield");
  });
});

describe("Ajani Unyielding", () => {
  it("+2 puts only the nonland permanent cards among the top three into your hand", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Unyielding");
    const giant = toLibrary(game, "Hill Giant");
    const bolt = toLibrary(game, "Lightning Bolt");
    const ring = toLibrary(game, "Sol Ring");
    const land = toLibrary(game, "Forest"); // on top; Hill Giant is fourth, not revealed
    loyalty(game, ajani, 2);
    // Revealed: Forest, Sol Ring, Lightning Bolt. Only Sol Ring is a nonland permanent card.
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, bolt)).toBe("library");
    expect(zone(game, land)).toBe("library");
    expect(zone(game, giant)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).toBe(giant);
    expect(library.slice(-2).sort()).toEqual([bolt, land].sort());
  });

  it("−2 exiles a creature and its controller gains life equal to its power", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Unyielding");
    const giant = spawn(game, "Hill Giant", B);
    loyalty(game, ajani, -2, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, B)).toBe(23);
  });

  it("−9 puts five loyalty counters on each other planeswalker you control, not on itself", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Unyielding");
    const other = spawn(game, "Nicol Bolas, the Deceiver");
    game.state.objects[other].counters.loyalty = 3;
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, ajani, -9, { atLeast: 10 });
    expect(counters(game, ajani, "loyalty")).toBe(1);
    expect(counters(game, other, "loyalty")).toBe(8);
    expect(counters(game, bears)).toBe(5);
  });
});

describe("Treasure Keeper", () => {
  it("dies, reveals to a nonland card of mana value 3 or less and casts it free", () => {
    const { game, a } = table();
    const keeper = spawn(game, "Treasure Keeper");
    const bears = toLibrary(game, "Grizzly Bears");
    const dragon = toLibrary(game, "Shivan Dragon"); // mana value 6: passed over
    a.chooseCastNowFn = (_v, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      return way === undefined ? null : { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, free: true };
    };
    destroy(game, keeper);
    expect(zone(game, bears)).toBe("battlefield");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(dragon);
  });
});

describe("Restoration Specialist", () => {
  it("returns an artifact card and an enchantment card from your graveyard", () => {
    const { game } = table();
    const specialist = spawn(game, "Restoration Specialist");
    lands(game, "Plains", 1);
    const ring = toGraveyard(game, "Sol Ring");
    const pacifism = toGraveyard(game, "Pacifism");
    activate(game, specialist, 0, { targets: [ref(ring), ref(pacifism)] });
    expect(zone(game, specialist)).toBe("graveyard");
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, pacifism)).toBe("hand");
  });
});

describe("Dark Intimations", () => {
  it("each opponent sacrifices and discards; you return a creature card and draw", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const dragon = toGraveyard(game, "Shivan Dragon");
    const theirHand = hand(game, B).length;
    const spell = toHand(game, "Dark Intimations");
    const before = hand(game).length;
    cast(game, spell);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(theirHand - 1);
    expect(zone(game, dragon)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 1 + 1);
  });

  it("exiles itself from your graveyard as you cast a Bolas planeswalker, which enters with an extra loyalty counter", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 5);
    const intimations = toGraveyard(game, "Dark Intimations");
    const bolas = toHand(game, "Nicol Bolas, the Deceiver");
    cast(game, bolas);
    expect(zone(game, intimations)).toBe("exile");
    expect(zone(game, bolas)).toBe("battlefield");
    const printed = registryOf(game).get("Nicol Bolas, the Deceiver").loyalty ?? 0;
    expect(counters(game, bolas, "loyalty")).toBe(printed + 1);
  });
});

describe("Renegade Wheelsmith", () => {
  it("attacking taps it, and the target creature can't block", () => {
    const { game, a } = table();
    const wheelsmith = spawn(game, "Renegade Wheelsmith");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    const offer = blockOffer(game, a, [wheelsmith]);
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, giant)).toEqual([wheelsmith]);
  });
});

describe("Destructive Tampering", () => {
  it("creatures without flying can't block — one that enters later included", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const attacker = spawn(game, "Hill Giant");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Destructive Tampering"), { modes: [1] });
    const late = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, late)).toEqual([]);
    expect(canBlock(offer, angel)).toEqual([attacker]);
  });
});

describe("Aether Chaser", () => {
  it("gets two energy, and pays them on attack for a Servo", () => {
    const { game, a } = table();
    const chaser = enter(game, "Aether Chaser");
    expect(game.state.players[A].energy).toBe(2);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: chaser, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("Perilous Predicament", () => {
  it("each opponent sacrifices an artifact creature and a nonartifact creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 4);
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Perilous Predicament"));
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("an opponent with only nonartifact creatures sacrifices just one", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Perilous Predicament"));
    expect([zone(game, bears), zone(game, giant)].filter((z) => z === "graveyard")).toHaveLength(1);
  });
});

describe("Ironclad Revolutionary", () => {
  it("may sacrifice an artifact for two counters and 2 life from each opponent", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [ring];
    const ironclad = enter(game, "Ironclad Revolutionary");
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, ironclad)).toBe(2);
    expect(life(game, B)).toBe(18);
  });

  it("declining sacrifices nothing and does nothing", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    pickModes(a);
    const ironclad = enter(game, "Ironclad Revolutionary");
    expect(zone(game, ring)).toBe("battlefield");
    expect(counters(game, ironclad)).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});

describe("Illuminate History", () => {
  it("discards any number, draws that many, then makes a Spirit with seven or more cards in your graveyard", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Wastes");
    const spell = toHand(game, "Illuminate History");
    const before = hand(game).length;
    a.chooseDiscardsFn = (cards) => cards.filter((c) => c.id !== spell).slice(0, 2).map((c) => c.id);
    cast(game, spell);
    // 4 + 2 discarded + Illuminate History itself, which is put there only after it resolves.
    expect(graveyard(game, A).length).toBe(7);
    expect(hand(game).length).toBe(before - 1);
    expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(0);
  });

  it("with seven after the discard, the Spirit is made", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Wastes");
    const spell = toHand(game, "Illuminate History");
    a.chooseDiscardsFn = (cards) => cards.filter((c) => c.id !== spell).slice(0, 3).map((c) => c.id);
    cast(game, spell);
    expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(1);
  });
});
