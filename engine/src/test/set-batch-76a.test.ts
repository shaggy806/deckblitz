/**
 * Set walk batch 76, part a (2026-10-15): Secrets of Strixhaven (SOS), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
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

/** The prepare spell copies in exile. */
const preparedCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const SPIRIT = "Spirit Token (Red-White 2/2)";
const INKLING = "Inkling Token (Emeritus of Truce)";

describe("Kirol, History Buff // Pack a Punch", () => {
  it("becomes prepared when a card leaves your graveyard; Pack a Punch mills, adds two counters and trample", () => {
    const { game } = table();
    const kirol = spawn(game, "Kirol, History Buff");
    expect(preparedCopies(game)).toHaveLength(0);
    const twice = toGraveyard(game, "Think Twice");
    lands(game, "Island", 3);
    cast(game, twice, { via: "flashback" });
    expect(game.state.objects[kirol].prepared).toBeDefined();
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Pack a Punch");

    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    const milled = graveyard(game).length;
    cast(game, copy, { via: "prepared", targets: [ref(bears)] });
    expect(game.state.objects[kirol].prepared).toBeUndefined();
    expect(graveyard(game).length).toBe(milled + 1);
    expect(counters(game, bears)).toBe(2);
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("an opponent's card leaving their graveyard doesn't prepare it", () => {
    const { game } = table();
    const kirol = spawn(game, "Kirol, History Buff");
    const twice = toGraveyard(game, "Think Twice", B);
    toStep(game, "upkeep", B);
    lands(game, "Island", 3, B);
    cast(game, twice, { player: B, via: "flashback" });
    expect(game.state.objects[kirol].prepared).toBeUndefined();
  });
});

describe("Tragedy Feaster", () => {
  it("at your end step you sacrifice a permanent if you gained no life this turn", () => {
    const { game, a } = table();
    const feaster = spawn(game, "Tragedy Feaster");
    const bears = spawn(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [bears];
    };
    toStep(game, "end");
    settle(game);
    expect(offered).toEqual(expect.arrayContaining([feaster, bears]));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, feaster)).toBe("battlefield");
  });

  it("sacrifices nothing once you've gained life this turn", () => {
    const { game, a } = table();
    const feaster = spawn(game, "Tragedy Feaster");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseSacrificesFn = () => [bears];
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, feaster)).toBe("battlefield");
  });
});

describe("Killian's Confidence", () => {
  it("pumps and draws, then returns from the graveyard for {W/B} when your creatures deal combat damage to a player", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const confidence = toHand(game, "Killian's Confidence");
    const handBefore = hand(game).length;
    cast(game, confidence, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(hand(game).length).toBe(handBefore); // the spell left, a card came in
    expect(zone(game, confidence)).toBe("graveyard");

    lands(game, "Swamp", 1);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, confidence)).toBe("hand");
  });

  it("stays in the graveyard when you decline to pay", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const confidence = toGraveyard(game, "Killian's Confidence");
    lands(game, "Plains", 1);
    pickModes(a);
    attack(game, a, [bears]);
    expect(zone(game, confidence)).toBe("graveyard");
  });
});

describe("Additive Evolution", () => {
  it("makes a 3/3 Fractal, then each combat on your turn gives a creature you control a counter and vigilance", () => {
    const { game } = table();
    enter(game, "Additive Evolution");
    const [fractal] = named(game, "Fractal Token");
    expect(pt(game, fractal)).toEqual({ power: 3, toughness: 3 });
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, fractal)).toBe(4);
    expect(keywords(game, fractal).has("vigilance")).toBe(true);
  });
});

describe("Vibrant Outburst", () => {
  it("deals 3 damage to any target and taps up to one target creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Vibrant Outburst"), { targets: [ref(B), ref(bears)] });
    expect(life(game, B)).toBe(17);
    expect(isTapped(game, bears)).toBe(true);
  });

  it("the tap is optional", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Vibrant Outburst"), { targets: [ref(bears), null] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Melancholic Poet", () => {
  it("drains each opponent for 1 when you cast an instant or sorcery that targets a creature", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Melancholic Poet");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(21);
    // Targeting a player doesn't trigger it.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(21);
  });
});

describe("Pigment Wrangler // Striking Palette", () => {
  it("enters prepared; Striking Palette copies the next instant or sorcery spell you cast this turn", () => {
    const { game } = table();
    const wrangler = enter(game, "Pigment Wrangler");
    expect(keywords(game, wrangler).has("flying")).toBe(true);
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Striking Palette");
    lands(game, "Mountain", 2);
    cast(game, copy, { via: "prepared" });
    expect(game.state.objects[wrangler].prepared).toBeUndefined();
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });
});

describe("Forum Necroscribe", () => {
  it("repartee returns a creature card from your graveyard to the battlefield", () => {
    const { game } = table();
    spawn(game, "Forum Necroscribe");
    const corpse = toGraveyard(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, corpse)).toBe("battlefield");
  });
});

describe("Page, Loose Leaf", () => {
  it("taps for {C}; grandeur discards another Page to reveal until an instant or sorcery", () => {
    const { game } = table();
    const page = spawn(game, "Page, Loose Leaf");
    toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    // No other Page in hand: grandeur can't be paid.
    expect(() => activate(game, page, 1)).toThrow();
    const other = toHand(game, "Page, Loose Leaf");
    toHand(game, "Grizzly Bears");
    activate(game, page, 1);
    expect(zone(game, other)).toBe("graveyard");
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Lightning Bolt")).toBe(true);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bears);
  });
});

describe("Antiquities on the Loose", () => {
  it("cast from hand makes two 2/2 Spirits; flashed back, every Spirit you control gets a counter", () => {
    const { game } = table();
    lands(game, "Plains", 9);
    const card = toHand(game, "Antiquities on the Loose");
    cast(game, card);
    expect(tokensNamed(game, SPIRIT)).toBe(2);
    for (const id of named(game, SPIRIT)) expect(counters(game, id)).toBe(0);
    expect(zone(game, card)).toBe("graveyard");
    cast(game, card, { via: "flashback" });
    expect(tokensNamed(game, SPIRIT)).toBe(4);
    for (const id of named(game, SPIRIT)) expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Antiquities on the Loose, copied", () => {
  it("a copy was never cast, so it puts no counters on", () => {
    const { game } = table();
    enter(game, "Pigment Wrangler");
    const [palette] = preparedCopies(game);
    lands(game, "Mountain", 1);
    cast(game, palette, { via: "prepared" });
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Antiquities on the Loose"));
    expect(tokensNamed(game, SPIRIT)).toBe(4);
    for (const id of named(game, SPIRIT)) expect(counters(game, id)).toBe(0);
  });
});

describe("Rapier Wit", () => {
  it("on your turn taps the creature, stuns it and draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Rapier Wit"), { targets: [ref(bears)] });
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("on another player's turn only taps and draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const wit = toHand(game, "Rapier Wit");
    game.advanceUntil(
      (s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A && s.zones.shared.stack.length === 0,
    );
    cast(game, wit, { targets: [ref(bears)] });
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(0);
  });
});

describe("Conciliator's Duelist", () => {
  it("enters drawing a card with each player losing 1; repartee flickers up to one creature until the end step", () => {
    const { game, a } = table();
    const before = hand(game).length;
    enter(game, "Conciliator's Duelist");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);

    const blocker = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    pickTargets(a, blocker);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(zone(game, blocker)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Hill Giant", B).some((id) => zone(game, id) === "battlefield")).toBe(true);
  });
});

describe("Harsh Annotation", () => {
  it("destroys the creature and its controller gets a 1/1 flying Inkling", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Harsh Annotation"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, INKLING, B)).toBe(1);
    expect(tokensNamed(game, INKLING, A)).toBe(0);
    const [inkling] = named(game, INKLING, B);
    expect(pt(game, inkling)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, inkling).has("flying")).toBe(true);
  });
});

describe("Postmortem Professor", () => {
  it("drains on attack, and returns from the graveyard by exiling an instant or sorcery card", () => {
    const { game, a } = table();
    const professor = spawn(game, "Postmortem Professor");
    attack(game, a, [professor]);
    expect(life(game, B)).toBe(17); // 1 drained, 2 combat
    expect(life(game, A)).toBe(21);

    const { game: g2 } = table();
    const dead = toGraveyard(g2, "Postmortem Professor");
    lands(g2, "Swamp", 2);
    expect(() => activate(g2, dead, 0)).toThrow(); // nothing to exile
    const bolt = toGraveyard(g2, "Lightning Bolt");
    activate(g2, dead, 0);
    expect(zone(g2, bolt)).toBe("exile");
    expect(named(g2, "Postmortem Professor").some((id) => zone(g2, id) === "battlefield")).toBe(true);
  });
});

describe("Proctor's Gaze", () => {
  it("bounces up to one nonland permanent and fetches a basic land tapped", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    pickFromZone(a, forest);
    cast(game, toHand(game, "Proctor's Gaze"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("battlefield");
    expect(isTapped(game, forest)).toBe(true);
  });

  it("can be cast with no target and still fetches", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    pickFromZone(a, forest);
    cast(game, toHand(game, "Proctor's Gaze"), { targets: [null] });
    expect(zone(game, forest)).toBe("battlefield");
  });
});
