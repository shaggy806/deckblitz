/**
 * Batch 70e — the phasing cards (rule 702.26): Teferi's Protection, Perch
 * Protection, Talon Gates of Madara, Clever Concealment, Galadriel's
 * Dismissal, Guardian of Faith, Teferi, Master of Time, Robe of Stars,
 * Oubliette, Haystack, Kaito Shizuki, Ripples of Potential, Vision,
 * Synthezoid Avenger, Slip Out the Back, Vronos, Masked Inquisitor and
 * Change of Plans. The mechanic itself is `phasing.test.ts`'s.
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
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  loyalty,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  pt,
  keywords,
  zone,
} from "./harness.js";

const out = (game: Game, id: ObjectId): boolean => game.state.objects[id].zone === "phased-out";

describe("Teferi's Protection", () => {
  it("phases out all you control, shields you from an attack, and is exiled", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const attacker = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    const protection = toHand(game, "Teferi's Protection");
    cast(game, protection);
    expect(zone(game, protection)).toBe("exile");
    expect(out(game, bears)).toBe(true);
    nextTurn(game);
    attack(game, b, [attacker], A);
    // The damage was prevented: protection from everything (702.16j).
    expect(life(game, A)).toBe(20);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Perch Protection", () => {
  it("without the gift: four 2/2 flying Birds and nothing else", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Perch Protection"));
    expect(tokensNamed(game, "2/2 Blue Bird Token", A)).toBe(4);
    expect(game.state.extraTurns).toEqual([]);
  });

  it("with the gift: the opponent's extra turn, then everything you control — the Birds too — phases out", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 6);
    const perch = toHand(game, "Perch Protection");
    game.dispatch({ type: "cast-spell", player: A, card: perch, targets: [], kicked: true });
    settle(game);
    expect(game.state.extraTurns).toEqual([B]);
    expect(tokensNamed(game, "2/2 Blue Bird Token", A)).toBe(0);
    const birds = (game.state.phasedOut ?? []).filter((id) => game.state.objects[id].cardName === "2/2 Blue Bird Token");
    expect(birds.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(4);
    for (const land of plains) expect(out(game, land)).toBe(true);
    expect(zone(game, perch)).toBe("exile");
    game.debugApplyEffect(B, { kind: "lose-life", who: "each-opponent", amount: 3 });
    expect(life(game, A)).toBe(20);
  });
});

describe("Talon Gates of Madara", () => {
  it("{4} from the hand puts it onto the battlefield, and its trigger phases a creature out", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const gates = toHand(game, "Talon Gates of Madara");
    pickTargets(a, bears);
    activate(game, gates, 2);
    expect(zone(game, gates)).toBe("battlefield");
    expect(out(game, bears)).toBe(true);
    // Bob's next untap step brings it back.
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Clever Concealment", () => {
  it("phases out the chosen permanents, an Equipment on one going with it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Grizzly Bears", A);
    const sword = spawn(game, "Bonesplitter", A);
    game.state.objects[sword].attachedTo = bears;
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Clever Concealment"), { targets: [ref(bears), ref(sword)] });
    expect(out(game, bears)).toBe(true);
    expect(out(game, sword)).toBe(true);
    // Both ways at once: indirectly (rule 702.26h).
    expect(game.state.objects[sword].phasedOut?.with).toBe(bears);
    expect(zone(game, other)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[sword].attachedTo).toBe(bears);
  });
});

describe("Galadriel's Dismissal", () => {
  it("unkicked: one target creature phases out", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const others = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Galadriel's Dismissal"), { targets: [ref(bears)] });
    expect(out(game, bears)).toBe(true);
    expect(zone(game, others)).toBe("battlefield");
  });

  it("kicked: each creature the target player controls, and no other", () => {
    const { game } = table();
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    const land = spawn(game, "Wastes", B);
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Galadriel's Dismissal"), { targets: [ref(B)], kicked: true });
    for (const id of theirs) expect(out(game, id)).toBe(true);
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Guardian of Faith", () => {
  it("phases out the other creatures you choose as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const kept = spawn(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    const guardian = enter(game, "Guardian of Faith");
    expect(out(game, bears)).toBe(true);
    expect(zone(game, kept)).toBe("battlefield");
    expect(zone(game, guardian)).toBe("battlefield");
  });
});

describe("Teferi, Master of Time", () => {
  it("activates a loyalty ability on an opponent's turn at instant speed, once each turn", () => {
    const { game } = table();
    const teferi = spawn(game, "Teferi, Master of Time", A);
    game.state.objects[teferi].counters.loyalty = 3;
    nextTurn(game); // bob's main phase, his priority
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    const before = hand(game, A).length;
    loyalty(game, teferi, 1, { player: A });
    expect(game.state.objects[teferi].counters.loyalty).toBe(4);
    expect(hand(game, A).length).toBe(before); // drew one, discarded one
    expect(game.canDispatch({ type: "activate-ability", player: A, source: teferi, abilityIndex: 0, targets: [] })).not.toBeNull();
    nextTurn(game); // alice's own turn: again
    loyalty(game, teferi, 1);
    expect(game.state.objects[teferi].counters.loyalty).toBe(5);
  });

  it("−3: a creature an opponent controls phases out", () => {
    const { game, a } = table();
    const teferi = spawn(game, "Teferi, Master of Time", A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    loyalty(game, teferi, -3, { atLeast: 3, targets: [ref(bears)] });
    expect(out(game, bears)).toBe(true);
  });

  it("−10: two extra turns", () => {
    const { game } = table();
    const teferi = spawn(game, "Teferi, Master of Time", A);
    loyalty(game, teferi, -10, { atLeast: 10 });
    expect(game.state.extraTurns).toEqual([A, A]);
  });
});

describe("Robe of Stars", () => {
  it("Astral Projection phases out the equipped creature, the Robe with it; both come back attached", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const robe = spawn(game, "Robe of Stars", A);
    game.state.objects[robe].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 5 });
    lands(game, "Plains", 2);
    activate(game, robe, 0);
    expect(out(game, bears)).toBe(true);
    expect(out(game, robe)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[robe].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 5 });
  });

  it("does nothing unattached", () => {
    const { game } = table();
    const robe = spawn(game, "Robe of Stars", A);
    lands(game, "Plains", 2);
    activate(game, robe, 0);
    expect(zone(game, robe)).toBe("battlefield");
  });
});

describe("Oubliette", () => {
  it("holds a creature until it leaves, then lets it go tapped", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const oubliette = enter(game, "Oubliette");
    expect(out(game, bears)).toBe(true);
    nextTurn(game);
    expect(out(game, bears)).toBe(true);
    destroy(game, oubliette, A);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Haystack", () => {
  it("phases out a creature you control until your next untap step", () => {
    const { game } = table();
    const haystack = spawn(game, "Haystack", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Wastes", 2);
    activate(game, haystack, 0, { targets: [ref(bears)] });
    expect(out(game, bears)).toBe(true);
    nextTurn(game);
    expect(out(game, bears)).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Kaito Shizuki", () => {
  it("phases out at the end step of the turn he entered, and phases in — not entering — at your next untap", () => {
    const { game } = table();
    const kaito = enter(game, "Kaito Shizuki");
    toStep(game, "end");
    settle(game);
    expect(out(game, kaito)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, kaito)).toBe("battlefield");
    expect(game.state.objects[kaito].counters.loyalty).toBe(3);
    toStep(game, "end");
    settle(game);
    expect(zone(game, kaito)).toBe("battlefield");
  });

  it("+1 draws and discards unless you attacked this turn; −2 makes an unblockable 1/1 Ninja", () => {
    const { game } = table();
    const kaito = spawn(game, "Kaito Shizuki", A);
    const before = hand(game, A).length;
    loyalty(game, kaito, 1, { atLeast: 3 });
    expect(hand(game, A).length).toBe(before);
    nextTurn(game);
    nextTurn(game);
    loyalty(game, kaito, -2, { atLeast: 3 });
    expect(tokensNamed(game, "Ninja Token (Kaito Shizuki)", A)).toBe(1);
    const ninja = game.battlefield.find((id) => game.state.objects[id].cardName === "Ninja Token (Kaito Shizuki)");
    expect(ninja !== undefined && keywords(game, ninja).has("unblockable")).toBe(true);
  });
});

describe("Ripples of Potential", () => {
  it("proliferates, then phases out the chosen permanents of yours that got a counter", () => {
    const { game, a } = table();
    const countered = spawn(game, "Grizzly Bears", A);
    game.state.objects[countered].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 2);
    a.chooseProliferateFn = () => [ref(countered)];
    const seen = pickPermanents(a, countered);
    cast(game, toHand(game, "Ripples of Potential"));
    expect(seen.offered).toEqual([countered]);
    expect(counters(game, countered)).toBe(2);
    expect(out(game, countered)).toBe(true);
    expect(zone(game, plain)).toBe("battlefield");
  });
});

describe("Vision, Synthezoid Avenger", () => {
  it("triggers on a spell cast on someone else's turn, and phases out on the chosen mode", () => {
    const { game, a } = table();
    const vision = spawn(game, "Vision, Synthezoid Avenger", A);
    lands(game, "Mountain", 1, B);
    game.dispatch({ type: "pass-priority", player: A });
    pickModes(a, 1);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(out(game, vision)).toBe(true);
  });

  it("puts a counter on itself on the other mode, and ignores a spell cast on its caster's turn", () => {
    const { game, a } = table();
    const vision = spawn(game, "Vision, Synthezoid Avenger", A);
    lands(game, "Mountain", 2, A);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, vision)).toBe(0);
    lands(game, "Mountain", 1, B);
    game.dispatch({ type: "pass-priority", player: A });
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(counters(game, vision)).toBe(1);
  });
});

describe("Slip Out the Back", () => {
  it("puts a +1/+1 counter on the creature, which phases out with it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Slip Out the Back"), { targets: [ref(bears)] });
    expect(out(game, bears)).toBe(true);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Vronos, Masked Inquisitor", () => {
  it("+1: the chosen planeswalkers phase out at the beginning of the next end step", () => {
    const { game } = table();
    const vronos = spawn(game, "Vronos, Masked Inquisitor", A);
    const other = spawn(game, "Teferi, Master of Time", A);
    game.state.objects[other].counters.loyalty = 3;
    loyalty(game, vronos, 1, { atLeast: 5, targets: [ref(other)] });
    expect(zone(game, other)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(out(game, other)).toBe(true);
    expect(zone(game, vronos)).toBe("battlefield");
  });

  it("−7: an artifact you control becomes a 9/9 Construct with vigilance, indestructible and can't be blocked", () => {
    const { game } = table();
    const vronos = spawn(game, "Vronos, Masked Inquisitor", A);
    const haystack = spawn(game, "Haystack", A);
    loyalty(game, vronos, -7, { atLeast: 7, targets: [ref(haystack)] });
    expect(types(game, haystack)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, haystack)).toContain("Construct");
    expect(pt(game, haystack)).toEqual({ power: 9, toughness: 9 });
    const kw = keywords(game, haystack);
    expect(kw.has("vigilance") && kw.has("indestructible") && kw.has("unblockable")).toBe(true);
    nextTurn(game);
    expect(pt(game, haystack)).toEqual({ power: 9, toughness: 9 });
  });
});

describe("Change of Plans", () => {
  it("X creatures connive, then any number of them phase out", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears", A);
    const two = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 4);
    let asked = 0;
    a.chooseModesFn = (_view, min) => {
      asked += 1;
      // Yes for the first, no for the second; discard prompts take the default.
      return asked === 1 ? [0] : Array.from({ length: min }, (_u, i) => i);
    };
    cast(game, toHand(game, "Change of Plans"), { targets: [ref(one), ref(two)], x: 2 });
    expect(out(game, one) !== out(game, two)).toBe(true);
  });
});
