/**
 * Set walk batch 78, part a (2026-10-15): Lorwyn Eclipsed (ECL), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
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

/** The cards in exile that carry a play permission. */
const playable = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].impulse !== undefined);

describe("Dawnhand Eulogist", () => {
  it("mills three; with an Elf card among them, each opponent loses 2 and you gain 2", () => {
    const { game } = table();
    toLibrary(game, "Llanowar Elves");
    toLibrary(game, "Wastes");
    const eulogist = enter(game, "Dawnhand Eulogist");
    expect(graveyard(game)).toHaveLength(3);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    expect(keywords(game, eulogist).has("menace")).toBe(true);
  });

  it("with no Elf card in your graveyard, only mills", () => {
    const { game } = table();
    toGraveyard(game, "Llanowar Elves", B);
    enter(game, "Dawnhand Eulogist");
    expect(graveyard(game)).toHaveLength(3);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });
});

describe("Warren Torchmaster", () => {
  it("blighting 1 at the beginning of combat gives a target creature haste", () => {
    const { game, a } = table();
    spawn(game, "Warren Torchmaster");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", A, { sick: true });
    pickModes(a, 0);
    pickPermanents(a, bears);
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(keywords(game, giant).has("haste")).toBe(true);
  });

  it("declining the blight: no counter, no haste", () => {
    const { game, a } = table();
    const torch = spawn(game, "Warren Torchmaster");
    const giant = spawn(game, "Hill Giant", A, { sick: true });
    pickModes(a);
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, torch, "-1/-1")).toBe(0);
    expect(keywords(game, giant).has("haste")).toBe(false);
  });
});

describe("Moonglove Extractor", () => {
  it("attacking, you draw a card and lose 1 life", () => {
    const { game, a } = table();
    const extractor = spawn(game, "Moonglove Extractor");
    const before = hand(game).length;
    attack(game, a, [extractor]);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });
});

describe("Rooftop Percher", () => {
  it("exiles up to two target cards from any graveyards and gains 3 life", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Hill Giant");
    const kept = toGraveyard(game, "Llanowar Elves", B);
    pickTargets(a, theirs, mine);
    const percher = enter(game, "Rooftop Percher");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, kept)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
    expect(keywords(game, percher).has("flying")).toBe(true);
  });

  it("with no target chosen, still gains the life", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a);
    enter(game, "Rooftop Percher");
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("with every chosen target gone on resolution, gains no life (the ruling)", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    enter(game, "Rooftop Percher", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(card)]);
    settle(game);
    expect(life(game, A)).toBe(20);
  });
});

describe("Enraged Flamecaster", () => {
  it("a spell of mana value 4 or greater you cast deals 2 to each opponent; a smaller one doesn't", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Enraged Flamecaster");
    lands(game, "Forest", 2);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Hill Giant"));
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("counts a chosen X in the spell's mana value (the ruling)", () => {
    const { game } = table();
    spawn(game, "Enraged Flamecaster");
    lands(game, "Mountain", 4);
    const target = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "End-Blaze Epiphany"), { x: 3, targets: [ref(target)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Shadow Urchin", () => {
  it("attacking, it blights 1", () => {
    const { game, a } = table();
    const urchin = spawn(game, "Shadow Urchin");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    attack(game, a, [urchin]);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(counters(game, urchin, "-1/-1")).toBe(0);
  });

  it("a creature you control dying with counters exiles that many, playable", () => {
    const { game } = table();
    spawn(game, "Shadow Urchin");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    game.state.objects[bears].counters["stun"] = 1;
    destroy(game, bears);
    expect(playable(game)).toHaveLength(3);
  });

  it("no counters, or an opponent's creature, exiles nothing", () => {
    const { game } = table();
    spawn(game, "Shadow Urchin");
    const bare = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 2;
    destroy(game, bare);
    destroy(game, theirs);
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });
});

describe("Dundoolin Weaver", () => {
  it("with three or more creatures (itself included), returns a permanent card", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    const card = toGraveyard(game, "Llanowar Elves");
    pickTargets(a, card);
    enter(game, "Dundoolin Weaver");
    expect(zone(game, card)).toBe("hand");
  });

  it("with fewer, it doesn't trigger", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const card = toGraveyard(game, "Llanowar Elves");
    pickTargets(a, card);
    enter(game, "Dundoolin Weaver");
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("End-Blaze Epiphany", () => {
  it("killing it exiles cards equal to its last power and makes one of them playable", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    // 4/2 as it dies: four cards, not its printed two.
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [
      ref(bears),
    ]);
    cast(game, toHand(game, "End-Blaze Epiphany"), { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.zones.shared.exile).toHaveLength(4);
    expect(playable(game)).toHaveLength(1);
  });

  it("dying later this turn still triggers it; surviving the turn, nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "End-Blaze Epiphany"), { x: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, bears);
    expect(game.state.zones.shared.exile).toHaveLength(2);

    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "End-Blaze Epiphany"), { x: 1, targets: [ref(giant)] });
    toStep(game, "precombat-main", B);
    destroy(game, giant, A);
    expect(game.state.zones.shared.exile).toHaveLength(2);
  });
});

describe("Lys Alana Informant", () => {
  it("surveils 1 when it enters and again when it dies", () => {
    const { game, a } = table();
    a.chooseScryFn = (_view, cards) => cards;
    const informant = enter(game, "Lys Alana Informant");
    expect(graveyard(game)).toHaveLength(1);
    destroy(game, informant);
    // The Informant itself, and the surveilled card.
    expect(graveyard(game)).toHaveLength(3);
  });
});

describe("Bark of Doran", () => {
  it("+0/+1, and a creature with toughness greater than power deals combat damage equal to its toughness", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bark = spawn(game, "Bark of Doran");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, bark, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
    const before = life(game, B);
    attack(game, a, [bears]);
    expect(before - life(game, B)).toBe(3);
  });

  it("not while power is at least its toughness", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bark = spawn(game, "Bark of Doran");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, bark, 0, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [
      ref(bears),
    ]);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Heirloom Auntie", () => {
  it("enters with two -1/-1 counters; another creature of yours dying surveils 1 and removes one", () => {
    const { game, a } = table();
    a.chooseScryFn = (_view, cards) => cards;
    const auntie = enter(game, "Heirloom Auntie");
    expect(pt(game, auntie)).toEqual({ power: 2, toughness: 2 });
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(counters(game, auntie, "-1/-1")).toBe(1);
    // The Bears and the surveilled card.
    expect(graveyard(game)).toHaveLength(2);
  });

  it("an opponent's creature dying does nothing", () => {
    const { game } = table();
    const auntie = enter(game, "Heirloom Auntie");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, auntie, "-1/-1")).toBe(2);
  });
});

describe("Auntie's Sentence", () => {
  it("first mode: you choose a nonland permanent card from the opponent's hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const land = toHand(game, "Mountain", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Auntie's Sentence"), { modes: [0], targets: [ref(B)] });
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, land)).toBe("hand");
    expect(zone(game, bolt)).toBe("hand");
  });

  it("second mode: target creature gets -2/-2", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Auntie's Sentence"), { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Creakwood Safewright", () => {
  it("enters with three -1/-1 counters and sheds one at your end step with an Elf card in your graveyard", () => {
    const { game } = table();
    const safewright = enter(game, "Creakwood Safewright");
    expect(pt(game, safewright)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Llanowar Elves");
    toStep(game, "end");
    settle(game);
    expect(counters(game, safewright, "-1/-1")).toBe(2);
  });

  it("no Elf card in your graveyard, no change", () => {
    const { game } = table();
    const safewright = enter(game, "Creakwood Safewright");
    toGraveyard(game, "Llanowar Elves", B);
    toStep(game, "end");
    settle(game);
    expect(counters(game, safewright, "-1/-1")).toBe(3);
  });
});

describe("Sizzling Changeling", () => {
  it("dying, exiles the top card of your library, playable", () => {
    const { game } = table();
    const changeling = spawn(game, "Sizzling Changeling");
    destroy(game, changeling);
    expect(playable(game)).toHaveLength(1);
  });
});

describe("Requiting Hex", () => {
  it("blighted: destroys a creature with mana value 2 or less and gains 2 life", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const mine = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, mine);
    cast(game, toHand(game, "Requiting Hex"), { kicked: true, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, mine, "-1/-1")).toBe(1);
    expect(life(game, A)).toBe(22);
  });

  it("not blighted: destroys, no life", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Requiting Hex"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });

  it("can't target a creature with mana value 3 or more", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Requiting Hex"), { targets: [ref(giant)] })).toThrow();
  });
});

describe("Blighted Blackthorn", () => {
  it("entering, you may blight 2; if you do, you draw a card and lose 1 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    const before = hand(game).length;
    enter(game, "Blighted Blackthorn");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });

  it("declined, nothing; attacking, it asks again", () => {
    const { game, a } = table();
    pickModes(a);
    const before = hand(game).length;
    const thorn = enter(game, "Blighted Blackthorn");
    expect(hand(game).length).toBe(before);
    expect(life(game, A)).toBe(20);
    pickModes(a, 0);
    pickPermanents(a, thorn);
    attack(game, a, [thorn]);
    expect(counters(game, thorn, "-1/-1")).toBe(2);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});
