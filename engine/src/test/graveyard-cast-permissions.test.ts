/**
 * Graveyard cast permissions (the `zone:graveyard-cast-permissions` family):
 *
 * - a resolved permission over **another player's** graveyard, for one spell,
 *   with its mana spendable as any color (Whispersteel Dagger — the
 *   `player-effect`'s `whose`, `once` and `spendAs`), and a cast-now from
 *   **any** graveyard (Spectral Arcanist — `cast-now`'s `"any-graveyard"`);
 * - a card's own permission with costs of its own (`castSelfFromGraveyard`,
 *   rule 601.2f): life and a discard (Demonic Embrace), an alternative cost
 *   (Raffine's Guidance, rule 118.9), exiling another creature card
 *   (Helbrute), {1} more per other creature card (Risen Executioner), and
 *   "or from exile" (Squee, the Immortal).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  graveyard,
  hand,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const graveyardCasts = (game: Game, card: ObjectId, player: PlayerId = A): LegalAction[] =>
  game
    .legalActions(player)
    .filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");

describe("Whispersteel Dagger", () => {
  const daggerHit = () => {
    const t = table();
    const { game, a } = t;
    const dagger = spawn(game, "Whispersteel Dagger");
    const rogue = spawn(game, "Vengeful Dead");
    game.state.objects[dagger].attachedTo = rogue;
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const elves = toGraveyard(game, "Llanowar Elves", B);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    attack(game, a, [rogue]);
    settle(game);
    return { ...t, bears, elves, bolt, mine };
  };

  it("lets you cast a creature spell from the damaged player's graveyard this turn, paying with any color", () => {
    const { game, bears, bolt, mine } = daggerHit();
    expect(game.state.turn.step).toBe("postcombat-main");
    // Only Swamps: {1}{G} is payable because mana may be spent as any color.
    lands(game, "Swamp", 2);
    expect(graveyardCasts(game, bears).length).toBeGreaterThan(0);
    // A creature card, from that player's graveyard: not their instant, not
    // your own graveyard.
    expect(graveyardCasts(game, bolt)).toEqual([]);
    expect(graveyardCasts(game, mine)).toEqual([]);
    cast(game, bears, { via: "graveyard-permission" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].owner).toBe(B);
  });

  it("is one spell: the permission is used up by the first", () => {
    const { game, bears, elves } = daggerHit();
    lands(game, "Swamp", 4);
    cast(game, bears, { via: "graveyard-permission" });
    expect(graveyardCasts(game, elves)).toEqual([]);
  });

  it("ends with the turn", () => {
    const { game, bears } = daggerHit();
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    lands(game, "Swamp", 2);
    expect(graveyardCasts(game, bears)).toEqual([]);
  });

  it("spends any color only for that spell — Grizzly Bears in hand still needs green", () => {
    const { game } = daggerHit();
    lands(game, "Swamp", 2);
    const inHand = toHand(game, "Grizzly Bears");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === inHand)).toBe(false);
  });
});

describe("Spectral Arcanist", () => {
  it("casts an instant or sorcery from an opponent's graveyard, free, mana value up to the Spirits, then exiles it", () => {
    const { game, a } = table();
    const opt = toGraveyard(game, "Opt", B);
    const divination = toGraveyard(game, "Divination", B);
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards;
      const way = offer.casts.find((c) => c.card === opt)!;
      return { type: "cast-spell", player: A, card: opt, targets: [], via: way.via, free: true };
    };
    const before = hand(game).length;
    const arcanist = game.debugSpawn("Spectral Arcanist", A, "battlefield", { announceEntry: true });
    settle(game);
    // One Spirit (itself): Opt (1) is offered, Divination (3) isn't.
    expect(arcanist).toBeDefined();
    expect(offered).toContain(opt);
    expect(offered).not.toContain(divination);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, opt)).toBe("exile");
  });
});

describe("Demonic Embrace", () => {
  it("is cast from your graveyard by paying 3 life and discarding a card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bear = spawn(game, "Grizzly Bears");
    const embrace = toGraveyard(game, "Demonic Embrace");
    const card = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [card];
    const held = hand(game).length;
    expect(graveyardCasts(game, embrace).length).toBe(1);
    cast(game, embrace, { via: "graveyard-permission", targets: [ref(bear)] });
    expect(zone(game, embrace)).toBe("battlefield");
    expect(life(game)).toBe(17);
    expect(zone(game, card)).toBe("graveyard");
    expect(hand(game).length).toBe(held - 1);
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 3 });
  });

  it("isn't offered with an empty hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Grizzly Bears");
    const embrace = toGraveyard(game, "Demonic Embrace");
    for (const id of [...hand(game)]) game.debugMove(id, "library");
    expect(graveyardCasts(game, embrace)).toEqual([]);
  });
});

describe("Raffine's Guidance", () => {
  it("is cast from your graveyard for {2}{W}, not {W}", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const guidance = toGraveyard(game, "Raffine's Guidance");
    lands(game, "Plains", 1);
    expect(graveyardCasts(game, guidance)).toEqual([]);
    lands(game, "Plains", 2);
    expect(graveyardCasts(game, guidance).length).toBeGreaterThan(0);
    cast(game, guidance, { via: "graveyard-permission", targets: [ref(bear)] });
    expect(zone(game, guidance)).toBe("battlefield");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(3);
  });
});

describe("Helbrute", () => {
  it("exiles another creature card from your graveyard, and only a creature card", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const helbrute = toGraveyard(game, "Helbrute");
    const bolt = toGraveyard(game, "Lightning Bolt");
    expect(graveyardCasts(game, helbrute)).toEqual([]);
    const bears = toGraveyard(game, "Grizzly Bears");
    const [offer] = graveyardCasts(game, helbrute);
    expect(offer?.kind === "cast-spell" ? offer.escapeExile?.choices : undefined).toEqual([bears]);
    expect(() => cast(game, helbrute, { via: "graveyard-permission", escapeExile: [bolt] })).toThrow();
    cast(game, helbrute, { via: "graveyard-permission", escapeExile: [bears] });
    expect(zone(game, helbrute)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Risen Executioner", () => {
  it("costs {1} more from the graveyard for each other creature card there", () => {
    const { game } = table();
    const executioner = toGraveyard(game, "Risen Executioner");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves");
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Swamp", 5);
    expect(graveyardCasts(game, executioner)).toEqual([]);
    lands(game, "Swamp", 1);
    cast(game, executioner, { via: "graveyard-permission" });
    expect(zone(game, executioner)).toBe("battlefield");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(6);
  });
});

describe("Squee, the Immortal", () => {
  it("is cast from your graveyard or from exile, for its mana cost", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const dead = toGraveyard(game, "Squee, the Immortal");
    const exiled = toExile(game, "Squee, the Immortal");
    expect(graveyardCasts(game, dead).length).toBe(1);
    cast(game, dead, { via: "graveyard-permission" });
    expect(zone(game, dead)).toBe("battlefield");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === exiled && x.via === "impulse")).toBe(true);
    // Legendary: the second one replaces the first (rule 704.5j) once cast.
    cast(game, exiled, { via: "impulse" });
    expect(graveyard(game).length + game.state.zones.shared.battlefield.length).toBeGreaterThan(0);
  });

  it("isn't castable from an opponent's exile or graveyard by you", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const theirs = toGraveyard(game, "Squee, the Immortal", B);
    const exiled = toExile(game, "Squee, the Immortal", B);
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && (x.card === theirs || x.card === exiled))).toBe(false);
  });
});

describe("a resolved permission over every graveyard (The Great Work's chapter III)", () => {
  it("reaches each player's instants and sorceries this turn, and exiles a spell cast that way", () => {
    const { game } = table({ players: 3 });
    game.debugApplyEffect(A, {
      kind: "player-effect",
      duration: "end-of-turn",
      mayPlay: { from: "graveyard", filter: { typesAnyOf: ["instant", "sorcery"] }, whose: "each-player", exileAfter: true },
    });
    lands(game, "Island", 3);
    const mine = toGraveyard(game, "Opt");
    const theirs = toGraveyard(game, "Divination", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    expect(graveyardCasts(game, mine).length).toBe(1);
    expect(graveyardCasts(game, theirs).length).toBe(1);
    expect(graveyardCasts(game, bears)).toEqual([]);
    // Bob may not use Alice's permission.
    expect(graveyardCasts(game, theirs, B)).toEqual([]);
    cast(game, theirs, { via: "graveyard-permission" });
    expect(zone(game, theirs)).toBe("exile");
    // Never used up: Opt is still offered (with the mana left).
    expect(graveyardCasts(game, mine).length).toBe(0);
    lands(game, "Island", 1);
    expect(graveyardCasts(game, mine).length).toBe(1);
  });
});
