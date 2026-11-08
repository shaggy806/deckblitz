/**
 * Cards a resolution exiled, and where one of them — or the rest — goes next:
 *
 * - `look-and-choose`'s `playable`: the card exiled from among the looked-at
 *   ones may be played — this turn (Florian, Voldaren Scion; Nahiri's
 *   Warcrafting) or for as long as it stays exiled, with mana of any type
 *   (Black Cat, Cunning Thief, face down from an opponent's library);
 * - exiled first, then one put from among them (`thisWay: "exiled"` over the
 *   exile zone): Lord of the Void's creature, mandatory;
 * - `move-exiled-this-way` to `"library-bottom"`: Herald of Amity's and Muse
 *   Vortex's "put the rest on the bottom of your library in a random order"
 *   after a free cast from among them (Muse Vortex's instants and sorceries
 *   to the hand first);
 * - the pick exiled and then cast free (The Key to the Vault);
 * - `leftover: "exile"`: Desperate Research's "exile the rest".
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  lands,
  life,
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
  nextTurn,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** The seat casts `card` if it's offered (free, targets as given), else
 * declines; records each offer. */
function castIfOffered(seat: ScriptedController, card: ObjectId | null, targets: readonly ObjectId[] = []) {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    if (card === null || !offer.cards.includes(card)) return null;
    const way = offer.casts.find((c) => c.card === card)!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card,
      targets: targets.map(ref),
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

const playsFromExile = (game: Game, card: ObjectId, player = A): boolean =>
  game
    .legalActions(player)
    .some((x) => (x.kind === "cast-spell" || x.kind === "play-land") && "card" in x && x.card === card);

describe("look-and-choose playable: the exiled pick may be played", () => {
  it("Florian: looks at as many as opponents lost life, exiles one playable this turn, the rest under", () => {
    const { game, a } = table();
    spawn(game, "Florian, Voldaren Scion");
    game.debugApplyEffect(A, { kind: "lose-life", who: "each-opponent", amount: 3 }, [], {});
    settle(game);
    const top = [toLibrary(game, "Wastes"), toLibrary(game, "Forest"), toLibrary(game, "Grizzly Bears")];
    const deeper = library(game)[3];
    const offered = pickFromZone(a, top[1]);
    toStep(game, "postcombat-main");
    settle(game);
    expect([...offered.offered].sort()).toEqual([...top].sort());
    expect(zone(game, top[1])).toBe("exile");
    expect(game.state.objects[top[1]].playPermission).toMatchObject({ player: A, expiry: "end-of-turn" });
    // The other two on the bottom; the fourth card is on top now.
    expect(library(game)[0]).toBe(deeper);
    expect(library(game).slice(-2)).toEqual(expect.arrayContaining([top[0], top[2]]));
    // A land: playable as the turn's land play.
    expect(playsFromExile(game, top[1])).toBe(true);
    // This turn only: back on alice's next turn, it's exiled and unplayable.
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, top[1])).toBe("exile");
    expect(playsFromExile(game, top[1])).toBe(false);
  });

  it("…and with no life lost, looks at nothing", () => {
    const { game } = table();
    spawn(game, "Florian, Voldaren Scion");
    const before = library(game).length;
    toStep(game, "postcombat-main");
    settle(game);
    expect(library(game).length).toBe(before);
    expect(game.state.zones.shared.exile.length).toBe(0);
  });

  it("Nahiri's Warcrafting: the excess damage is how many it looks at; the card exiled is castable this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    // Three for the spell, four for the Giant.
    lands(game, "Mountain", 7);
    const top = [toLibrary(game, "Wastes"), toLibrary(game, "Shock"), toLibrary(game, "Hill Giant"), toLibrary(game, "Wastes")];
    const offered = pickFromZone(a, top[2]);
    pickTargets(a, bears);
    cast(game, toHand(game, "Nahiri's Warcrafting"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // 5 to a 2/2: 3 excess, the top three looked at.
    expect([...offered.offered].sort()).toEqual([top[3], top[2], top[1]].sort());
    expect(zone(game, top[2])).toBe("exile");
    expect(playsFromExile(game, top[2])).toBe(true);
    expect(zone(game, top[0])).toBe("library");
    expect(library(game)[0]).toBe(top[0]);
  });

  it("…and may exile nothing, all of them going under", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    const top = [toLibrary(game, "Shock"), toLibrary(game, "Hill Giant")];
    pickFromZone(a);
    cast(game, toHand(game, "Nahiri's Warcrafting"), { targets: [ref(bears)] });
    expect(zone(game, top[0])).toBe("library");
    expect(zone(game, top[1])).toBe("library");
    expect(game.state.zones.shared.exile.length).toBe(0);
  });

  it("Black Cat: two of the top nine of target opponent's library, exiled face down, playable while exiled with mana of any type", () => {
    const { game, a } = table();
    const theirs = [toLibrary(game, "Hill Giant", B), toLibrary(game, "Forest", B)];
    const nine = library(game, B).slice(0, 9);
    const offered = pickFromZone(a, ...theirs);
    pickTargets(a, B);
    enter(game, "Black Cat, Cunning Thief");
    expect([...offered.offered].sort()).toEqual([...nine].sort());
    for (const id of theirs) {
      expect(zone(game, id)).toBe("exile");
      expect(game.state.objects[id].exiledFaceDown?.lookers).toEqual([A]);
      expect(game.state.objects[id].playPermission).toMatchObject({ player: A, expiry: "permanent", spendAs: "any-type" });
    }
    // The other seven under their library.
    expect(library(game, B).slice(-7)).toEqual(expect.arrayContaining(nine.filter((id) => !theirs.includes(id))));
    // Still playable on a later turn: the land as a land play.
    nextTurn(game);
    nextTurn(game);
    expect(playsFromExile(game, theirs[1])).toBe(true);
  });
});

describe("exiled, then one put from among them", () => {
  it("Lord of the Void: a creature card from the seven exiled onto the battlefield under your control — not optional", () => {
    const { game, a } = table();
    const lord = spawn(game, "Lord of the Void");
    const giant = toLibrary(game, "Hill Giant", B);
    const seven = library(game, B).slice(0, 7);
    let least = -1;
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      offered = eligible;
      least = min;
      return [giant];
    };
    attack(game, a, [lord]);
    settle(game);
    expect(life(game, B)).toBe(13);
    expect(offered).toEqual([giant]);
    expect(least).toBe(1);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    for (const id of seven.filter((x) => x !== giant)) expect(zone(game, id)).toBe("exile");
  });
});

describe("move-exiled-this-way to the library's bottom", () => {
  it("Herald of Amity: an Aura cast free from among the eight, the rest under in a random order", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = toLibrary(game, "Holy Strength");
    const eight = library(game).slice(0, 8);
    const ninth = library(game)[8];
    const seen = castIfOffered(a, aura, [bears]);
    enter(game, "Herald of Amity");
    expect(seen.offered[0]).toEqual([aura]);
    expect(game.state.objects[aura].attachedTo).toBe(bears);
    // The other seven: no longer exiled, at the bottom; the ninth on top.
    for (const id of eight.filter((x) => x !== aura)) expect(zone(game, id)).toBe("library");
    expect(library(game)[0]).toBe(ninth);
    expect(library(game).slice(-7)).toEqual(expect.arrayContaining(eight.filter((x) => x !== aura)));
  });

  it("…and with nothing cast, all eight go under", () => {
    const { game, a } = table();
    const aura = toLibrary(game, "Holy Strength");
    castIfOffered(a, null);
    enter(game, "Herald of Amity");
    expect(zone(game, aura)).toBe("library");
    expect(game.state.zones.shared.exile.length).toBe(0);
    expect(library(game).slice(-8)).toContain(aura);
  });

  it("Muse Vortex: one cast free; the instants and sorceries not cast to your hand, the rest under", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const forest = toLibrary(game, "Forest");
    const divination = toLibrary(game, "Divination");
    const opt = toLibrary(game, "Opt");
    const seen = castIfOffered(a, divination);
    const vortex = toHand(game, "Muse Vortex");
    const handBefore = hand(game).length;
    cast(game, vortex, { x: 3 });
    // Mana value X (3) or less: both offered.
    expect([...seen.offered[0]].sort()).toEqual([divination, opt].sort());
    expect(zone(game, divination)).toBe("graveyard");
    expect(zone(game, opt)).toBe("hand");
    expect(zone(game, forest)).toBe("library");
    expect(library(game)[library(game).length - 1]).toBe(forest);
    // The Vortex left, Opt and Divination's two draws came in.
    expect(hand(game).length).toBe(handBefore - 1 + 1 + 2);
  });

  it("…a spell above X isn't offered, and declining puts every instant and sorcery into your hand", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const divination = toLibrary(game, "Divination");
    const opt = toLibrary(game, "Opt");
    const seen = castIfOffered(a, null);
    cast(game, toHand(game, "Muse Vortex"), { x: 2 });
    expect(seen.offered[0]).toEqual([opt]);
    expect(zone(game, divination)).toBe("hand");
    expect(zone(game, opt)).toBe("hand");
  });
});

describe("The Key to the Vault: look at that many, exile a nonland card, cast it free", () => {
  it("casts the exiled card as the trigger resolves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const key = spawn(game, "The Key to the Vault");
    lands(game, "Island", 3);
    activate(game, key, 0, { targets: [ref(bears)] });
    expect(game.state.objects[key].attachedTo).toBe(bears);
    const top = [toLibrary(game, "Forest"), toLibrary(game, "Divination")];
    const offered = pickFromZone(a, top[1]);
    castIfOffered(a, top[1]);
    const handBefore = hand(game).length;
    attack(game, a, [bears]);
    settle(game);
    // 2 combat damage: the top two looked at; only the nonland one may be exiled.
    expect(offered.offered).toEqual([top[1]]);
    expect(zone(game, top[1])).toBe("graveyard");
    expect(hand(game).length).toBe(handBefore + 2);
    expect(zone(game, top[0])).toBe("library");
  });

  it("…and one not cast stays exiled", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const key = spawn(game, "The Key to the Vault");
    lands(game, "Island", 3);
    activate(game, key, 0, { targets: [ref(bears)] });
    const divination = toLibrary(game, "Divination");
    pickFromZone(a, divination);
    castIfOffered(a, null);
    attack(game, a, [bears]);
    settle(game);
    expect(zone(game, divination)).toBe("exile");
    expect(game.state.objects[divination].playPermission).toBeUndefined();
  });
});

describe("leftover exile: Desperate Research", () => {
  it("every card with the chosen name to the hand, the rest exiled", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Hill Giant"), toLibrary(game, "Grizzly Bears")];
    const seven = library(game).slice(0, 7);
    a.chooseCardNameFn = () => "Grizzly Bears";
    cast(game, toHand(game, "Desperate Research"));
    expect(zone(game, top[0])).toBe("hand");
    expect(zone(game, top[2])).toBe("hand");
    for (const id of seven.filter((x) => x !== top[0] && x !== top[2])) expect(zone(game, id)).toBe("exile");
    expect(game.state.objects[top[1]].exiledFaceDown).toBeUndefined();
  });
});
