/**
 * Card batch 70, part a (2026-10-12): EDHREC ranks 7040–7086. Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** Activate `source`'s ability `index`, sacrificing `sacrifice` for its cost. */
const activateSacrificing = (
  game: Game,
  source: ObjectId,
  index: number,
  sacrifice: ObjectId,
  targets: Extract<Action, { type: "activate-ability" }>["targets"] = [],
): void => {
  const action = { type: "activate-ability", player: A, source, abilityIndex: index, targets, sacrifice } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
};

const castOffer = (game: Game, card: ObjectId) =>
  game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card);

/** Cast `card` as its first legal offer says (a graveyard permission's `via`
 * and grant included), with no targets, then settle. */
const castAsOffered = (game: Game, card: ObjectId): void => {
  const offer = castOffer(game, card);
  if (offer?.kind !== "cast-spell") throw new Error("no cast offer");
  game.dispatch({
    type: "cast-spell",
    player: A,
    card,
    targets: [],
    ...(offer.via !== undefined ? { via: offer.via } : {}),
    ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
  });
  settle(game);
};

describe("Haakon, Stromgald Scourge", () => {
  it("can't be cast from the hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const haakon = toHand(game, "Haakon, Stromgald Scourge");
    expect(castOffer(game, haakon)).toBeUndefined();
    expect(game.canDispatch({ type: "cast-spell", player: A, card: haakon, targets: [] })).not.toBeNull();
  });

  it("is cast from the graveyard, then lets Knight spells be cast from there, and costs 2 life when it dies", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Plains", 2);
    const paladin = toGraveyard(game, "Accorder Paladin");
    // No permission for the Knight while Haakon isn't on the battlefield.
    expect(castOffer(game, paladin)).toBeUndefined();
    const haakon = toGraveyard(game, "Haakon, Stromgald Scourge");
    castAsOffered(game, haakon);
    expect(zone(game, haakon)).toBe("battlefield");
    castAsOffered(game, paladin);
    expect(zone(game, paladin)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(haakon)]);
    settle(game);
    expect(zone(game, haakon)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });
});

describe("Otherworld Atlas", () => {
  it("each player draws one card per charge counter", () => {
    const { game } = table();
    const atlas = spawn(game, "Otherworld Atlas");
    activate(game, atlas, 0);
    game.state.objects[atlas].tapped = false;
    activate(game, atlas, 0);
    game.state.objects[atlas].tapped = false;
    expect(counters(game, atlas, "charge")).toBe(2);
    const [mine, theirs] = [hand(game, A).length, hand(game, B).length];
    activate(game, atlas, 1);
    expect(hand(game, A).length).toBe(mine + 2);
    expect(hand(game, B).length).toBe(theirs + 2);
  });
});

describe("Imskir Iron-Eater", () => {
  it("draws and loses half the artifacts you control, rounded down", () => {
    const { game } = table();
    for (let i = 0; i < 5; i += 1) spawn(game, "Ornithopter");
    const before = hand(game).length;
    enter(game, "Imskir Iron-Eater");
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });

  it("deals damage equal to the sacrificed artifact's mana value", () => {
    const { game } = table();
    const imskir = spawn(game, "Imskir Iron-Eater");
    const sphere = spawn(game, "Commander's Sphere");
    lands(game, "Mountain", 4);
    activateSacrificing(game, imskir, 0, sphere, [ref(B)]);
    expect(zone(game, sphere)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Mardu Ascendancy", () => {
  it("makes an attacking Goblin for a nontoken attacker, none for a token one", () => {
    const { game, a } = table();
    spawn(game, "Mardu Ascendancy");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const [soldier] = named(game, "Soldier Token", A);
    game.state.objects[soldier].summoningSick = false;
    attack(game, a, [bears, soldier]);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(1);
    // Bears 2 + Soldier 1 + Goblin 1.
    expect(life(game, B)).toBe(16);
  });
});

describe("Borrowing 100,000 Arrows", () => {
  it("counts only the target opponent's tapped creatures", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A, { tapped: true });
    const spell = toHand(game, "Borrowing 100,000 Arrows");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Dalakos, Crafter of Wonders", () => {
  it("gives equipped creatures you control flying and haste", () => {
    const { game } = table();
    spawn(game, "Dalakos, Crafter of Wonders");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Wastes", 1);
    activate(game, splitter, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(keywords(game, other).has("flying")).toBe(false);
  });
});

describe("Spider-Man, Miles Morales", () => {
  it("on attack, puts a counter on and gives trample to each other creature you control", () => {
    const { game, a } = table();
    const spidey = spawn(game, "Spider-Man, Miles Morales");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    attack(game, a, [spidey]);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(counters(game, spidey)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });

  it("does it on entering too", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Spider-Man, Miles Morales");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Immersturm Predator", () => {
  it("tapped by its own ability, exiles the chosen graveyard card and grows", () => {
    const { game, a } = table();
    const predator = spawn(game, "Immersturm Predator");
    const bears = spawn(game, "Grizzly Bears");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    activateSacrificing(game, predator, 0, bears);
    expect(game.state.objects[predator].tapped).toBe(true);
    expect(keywords(game, predator).has("indestructible")).toBe(true);
    expect(zone(game, card)).toBe("exile");
    expect(counters(game, predator)).toBe(1);
  });

  it("with no target chosen still gets its counter", () => {
    const { game, a } = table();
    const predator = spawn(game, "Immersturm Predator");
    const bears = spawn(game, "Grizzly Bears");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, null);
    activateSacrificing(game, predator, 0, bears);
    expect(zone(game, card)).toBe("graveyard");
    expect(counters(game, predator)).toBe(1);
  });
});

describe("Charitable Levy", () => {
  it("taxes noncreature spells, and on the third is sacrificed to draw and fetch a Plains", () => {
    const { game, a } = table();
    const levy = spawn(game, "Charitable Levy");
    const mountains = lands(game, "Mountain", 6);
    const plains = toLibrary(game, "Plains");
    toLibrary(game, "Wastes"); // what the Levy's draw takes
    const shocks = [toHand(game, "Shock"), toHand(game, "Shock"), toHand(game, "Shock")];
    const before = hand(game).length;
    pickTargets(a, B);
    cast(game, shocks[0], { targets: [ref(B)] });
    cast(game, shocks[1], { targets: [ref(B)] });
    // {1}{R} each: four Mountains for two Shocks.
    expect(mountains.filter((m) => game.state.objects[m].tapped).length).toBe(4);
    expect(counters(game, levy, "collection")).toBe(2);
    expect(zone(game, levy)).toBe("battlefield");
    pickModes(a, 0);
    pickFromZone(a, plains);
    cast(game, shocks[2], { targets: [ref(B)] });
    expect(zone(game, levy)).toBe("graveyard");
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
    // Three Shocks left the hand; the Levy drew one (the Plains was found by
    // the search, not drawn).
    expect(hand(game).length).toBe(before - 3 + 1);
    expect(life(game, B)).toBe(14);
  });
});
