/**
 * Set walk batch 75, part e (2026-10-15): Secrets of Strixhaven Commander (SOC),
 * the rest of the set. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
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
/** A real token (`spawn` of a token's card isn't one), able to attack. */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

describe("Lattice Library", () => {
  it("enters with X study counters and makes a Fractal with that many +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Lattice Library"), { x: 3 });
    const [library] = named(game, "Lattice Library");
    expect(counters(game, library, "study")).toBe(3);
    const [fractal] = named(game, "Fractal Token");
    expect(counters(game, fractal)).toBe(3);
    expect(pt(game, fractal)).toEqual({ power: 3, toughness: 3 });
  });

  it("its own cast uses the turn's first {X} spell, so only the next turn's first one triggers it", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Lattice Library"), { x: 2 });
    expect(tokensNamed(game, "Fractal Token")).toBe(1);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 1 });
    expect(tokensNamed(game, "Fractal Token")).toBe(1);
    toStep(game, "precombat-main");
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 1 });
    expect(tokensNamed(game, "Fractal Token")).toBe(2);
    // A later {X} spell the same turn doesn't.
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 1 });
    expect(tokensNamed(game, "Fractal Token")).toBe(2);
    const fractals = named(game, "Fractal Token");
    expect(fractals.map((id) => counters(game, id))).toEqual([2, 2]);
  });
});

describe("Relic Retriever", () => {
  it("makes a Treasure at each end step only if a card left your graveyard that turn", () => {
    const { game } = table();
    spawn(game, "Relic Retriever");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
    // Bob's turn: a card leaves alice's graveyard, and his end step pays out.
    toStep(game, "precombat-main", B);
    const card = toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(card)]);
    settle(game);
    toStep(game, "end", B);
    settle(game);
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
  });

  it("an opponent's card leaving their graveyard doesn't count", () => {
    const { game } = table();
    spawn(game, "Relic Retriever");
    const card = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(card)]);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
  });
});

describe("Muddle, the Ever-Changing", () => {
  it("becomes a copy of a nonlegendary creature you control with myriad until end of turn", () => {
    const { game, a } = table({ players: 3 });
    const muddle = spawn(game, "Muddle, the Ever-Changing");
    const angel = spawn(game, "Serra Angel");
    spawn(game, "Barktooth Warbeard");
    lands(game, "Mountain", 1);
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered = legal[0] ?? [];
      return [ref(angel)];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    // Only the nonlegendary creature you control (not Muddle, not Barktooth).
    expect(offered).toEqual([ref(angel)]);
    expect(pt(game, muddle)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, muddle).has("vigilance")).toBe(true);
    // Myriad: attacking bob, a token copy attacks carol too.
    pickModes(a, 0);
    attack(game, a, [muddle], B);
    expect(life(game, B)).toBe(13);
    expect(life(game, C)).toBe(16);
    // Back to itself after the cleanup step.
    toStep(game, "precombat-main", B);
    expect(pt(game, muddle)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[muddle].cardName).toBe("Muddle, the Ever-Changing");
  });
});

describe("Inspired Skypainter // Maestro's Gift", () => {
  it("enters prepared; Maestro's Gift makes a hasty token copy of a creature you control", () => {
    const { game } = table();
    const skypainter = enter(game, "Inspired Skypainter");
    expect(game.state.objects[skypainter].prepared).toBeDefined();
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Maestro's Gift");
    toStep(game, "postcombat-main");
    const angel = spawn(game, "Serra Angel");
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    cast(game, copy, { via: "prepared", targets: [ref(angel)] });
    const tokens = named(game, "Serra Angel").filter((id) => game.state.objects[id].isToken);
    expect(tokens).toHaveLength(1);
    expect(keywords(game, tokens[0]).has("haste")).toBe(true);
    expect(game.state.objects[skypainter].prepared).toBeUndefined();
  });

  it("becomes prepared when a creature token you control deals combat damage to a player, not a nontoken creature", () => {
    const { game, a } = table();
    const skypainter = spawn(game, "Inspired Skypainter");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(game.state.objects[skypainter].prepared).toBeUndefined();
    toStep(game, "precombat-main");
    const soldier = makeToken(game, "Soldier Token");
    attack(game, a, [soldier], B);
    expect(game.state.objects[skypainter].prepared).toBeDefined();
  });
});

describe("Merchant of Venom", () => {
  it("makes each player sacrifice a creature, and grows for each permanent sacrificed", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    pickPermanents(a, mine);
    const merchant = enter(game, "Merchant of Venom");
    expect(zone(game, mine)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    expect(counters(game, merchant)).toBe(2);
    // Any player's sacrifice of any permanent.
    const treasure = spawn(game, "Treasure Token", B);
    game.debugApplyEffect(B, { kind: "sacrifice-target", target: 0 }, [ref(treasure)]);
    settle(game);
    expect(counters(game, merchant)).toBe(3);
  });
});

describe("Vanguard of the Restless", () => {
  it("pumps Spirits you control once per commander cast from the command zone", () => {
    const { game } = table();
    const vanguard = spawn(game, "Vanguard of the Restless");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Spirit Token (Red-White)", B);
    expect(pt(game, vanguard)).toEqual({ power: 2, toughness: 2 });
    game.state.players[A].commanderCastCounts = { "Isperia, Supreme Judge": 2 };
    expect(pt(game, vanguard)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 2 });
  });

  it("returns from your graveyard when a Spirit you control enters and you pay {2}{W}", () => {
    const { game, a } = table();
    const vanguard = toGraveyard(game, "Vanguard of the Restless");
    lands(game, "Plains", 3);
    enter(game, "Grizzly Bears");
    expect(zone(game, vanguard)).toBe("graveyard");
    pickModes(a, 0);
    enter(game, "Spirit Token (Red-White)");
    expect(named(game, "Vanguard of the Restless")).toHaveLength(1);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Striding Shotcaller // Run the Play", () => {
  it("becomes prepared on combat damage to a player; Run the Play counters and grants flying to up to X, then draws", () => {
    const { game, a } = table();
    const shotcaller = spawn(game, "Striding Shotcaller");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    attack(game, a, [bears], B);
    expect(game.state.objects[shotcaller].prepared).toBeDefined();
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Run the Play");
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const drawn = toLibrary(game, "Island");
    cast(game, copy, { via: "prepared", x: 2, targets: [ref(bears), ref(elves)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, elves)).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, shotcaller).has("flying")).toBe(false);
    expect(zone(game, drawn)).toBe("hand");
  });
});

describe("Ceaseless Conflict", () => {
  it("destroys all creatures, then makes a 3/2 Spirit for each nontoken creature you controlled destroyed", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    makeToken(game, "Soldier Token");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Ceaseless Conflict"));
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(2);
    expect(tokensNamed(game, "Spirit Token (Red-White)", B)).toBe(0);
  });
});

describe("Lorehold Archivist // Restore Relic", () => {
  it("becomes prepared at your upkeep only with three or more artifact and/or creature cards in your graveyard", () => {
    const { game } = table();
    const archivist = spawn(game, "Lorehold Archivist");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[archivist].prepared).toBeUndefined();
    toGraveyard(game, "Llanowar Elves");
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[archivist].prepared).toBeDefined();
  });

  it("Restore Relic exiles an artifact or creature card from your graveyard and makes a token copy of it", () => {
    const { game } = table();
    const archivist = spawn(game, "Lorehold Archivist");
    game.debugApplyEffect(A, { kind: "become-prepared", target: 0 }, [ref(archivist)]);
    settle(game);
    const [copy] = preparedCopies(game);
    const angel = toGraveyard(game, "Serra Angel");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    cast(game, copy, { via: "prepared", targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("exile");
    expect(tokensNamed(game, "Serra Angel", A)).toBe(1);
  });
});

describe("Renegade Bull", () => {
  it("gets +X/+0 for each instant or sorcery's mana value", () => {
    const { game } = table();
    const bull = spawn(game, "Renegade Bull");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 3 });
    expect(pt(game, bull)).toEqual({ power: 5, toughness: 5 });
  });

  it("attacking, exiles up to one instant or sorcery card from your graveyard and may cast a copy free", () => {
    const { game, a } = table();
    const bull = spawn(game, "Renegade Bull");
    const bolt = toGraveyard(game, "Lightning Bolt");
    a.chooseTargetsFn = (_view, source, _specs, legal) =>
      source === "Lightning Bolt" ? [ref(B)] : legal.map((options) => options[0] ?? null);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, free: true };
    };
    attack(game, a, [bull], B);
    expect(zone(game, bolt)).toBe("exile");
    // 3 from the copy, and 1 from the Bull: casting the copy is casting a
    // spell (rule 707.12), so it got +1/+0.
    expect(life(game, B)).toBe(16);
  });
});

describe("Fateful Tempest", () => {
  it("mills for each past vote, deals their total mana value to each opponent, and exiles to play for each present vote", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 3);
    const exiled = toLibrary(game, "Grizzly Bears");
    const milled = toLibrary(game, "Serra Angel");
    // Alice votes past, bob present: mill one (Serra Angel, 5), exile one.
    pickModes(a, 0);
    pickModes(b, 1);
    cast(game, toHand(game, "Fateful Tempest"));
    expect(zone(game, milled)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
    expect(zone(game, exiled)).toBe("exile");
    lands(game, "Forest", 2);
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === exiled)).toBe(true);
  });
});

describe("Prismari Pianist", () => {
  it("one Elemental for a small spell, three for mana value 5 or greater", () => {
    const { game } = table();
    spawn(game, "Prismari Pianist");
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Elemental Token (Prismari Pianist)")).toBe(1);
    // Fireball with X = 4 is mana value 5 on the stack (rule 202.3e).
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 4 });
    expect(tokensNamed(game, "Elemental Token (Prismari Pianist)")).toBe(4);
  });

  it("countered before the trigger resolves, the spell's X still counts (the ruling)", () => {
    const { game } = table();
    spawn(game, "Prismari Pianist");
    lands(game, "Mountain", 5);
    const fireball = toHand(game, "Fireball");
    cast(game, fireball, { targets: [ref(B)], x: 4, settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(fireball)]);
    settle(game);
    expect(zone(game, fireball)).toBe("graveyard");
    expect(tokensNamed(game, "Elemental Token (Prismari Pianist)")).toBe(3);
  });
});
