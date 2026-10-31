/**
 * Energy paid as a cost in a chosen, fixed or computed amount (rule 107.14):
 * a `may`'s `costEnergyX` — "you may pay any amount of {E}" / "one or more
 * {E}", X the amount paid — an `alternativeCostForSpells` paid in energy (with
 * its `flash`, rule 601.3c), a `cast-now`'s `byPayingEnergy`, and a `may`'s
 * `costEnergy` read from a graveyard card's mana value.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  enter,
  lands,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const energy = (game: Game, player = A): number => game.state.players[player].energy;

type ModesOffer = Extract<LegalAction, { kind: "choose-modes" }>;

/** Run to the `may`'s question and return its offer. */
function modesOffer(game: Game): ModesOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.result.over);
  const offer = game.legalActions(A).find((a): a is ModesOffer => a.kind === "choose-modes");
  if (offer === undefined) throw new Error("no choose-modes offer");
  return offer;
}

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("you may pay any amount of {E} (costEnergyX: any)", () => {
  it("Harnessed Lightning offers X up to all the energy, earlier energy included, and deals that much", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    game.state.players[A].energy = 2;
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Harnessed Lightning"), { targets: [ref(giant)], settle: false });
    const offer = modesOffer(game);
    expect(offer.xCost).toEqual({ maxX: 5, energy: true });
    expect(game.canDispatch({ type: "choose-modes", player: A, modes: [0], xValue: 6 })).not.toBeNull();
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(damage(game, giant)).toBe(2);
    expect(zone(game, giant)).toBe("battlefield");
    expect(energy(game)).toBe(3);
  });

  it("Harnessed Lightning declined is 0 paid: no damage, the energy kept", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Harnessed Lightning"), { targets: [ref(giant)], settle: false });
    modesOffer(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [] });
    settle(game);
    expect(damage(game, giant)).toBe(0);
    expect(energy(game)).toBe(3);
  });

  it("Die Young gives -1/-1 for each {E} paid", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Die Young"), { targets: [ref(giant)], settle: false });
    modesOffer(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(energy(game)).toBe(0);
  });

  it("Wrath of the Skies reads the energy paid, not the spell's X", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    game.state.players[A].energy = 1;
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Wrath of the Skies"), { x: 2, settle: false });
    expect(modesOffer(game).xCost?.maxX).toBe(3);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("Wrath of the Skies with nothing paid still destroys mana value 0 — and with no energy asks nothing", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const ornithopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Wrath of the Skies"), { x: 0, settle: false });
    game.advanceUntil((s) => s.awaiting !== null || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting).toBeNull();
    expect(zone(game, ornithopter)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("declining with spell X 2 is paying 0, not 2", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const ornithopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Wrath of the Skies"), { x: 2, settle: false });
    modesOffer(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [] });
    settle(game);
    expect(zone(game, ornithopter)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(energy(game)).toBe(2);
  });
});

describe("you may pay one or more {E} (costEnergyX: one-or-more)", () => {
  it("Territorial Aetherkite asks for at least one, and its reflexive trigger deals that much to each other creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const kite = enter(game, "Territorial Aetherkite", A, { settle: false });
    const offer = modesOffer(game);
    expect(offer.xCost).toEqual({ maxX: 2, minX: 1, energy: true });
    expect(game.canDispatch({ type: "choose-modes", player: A, modes: [0], xValue: 0 })).not.toBeNull();
    expect(game.canDispatch({ type: "choose-modes", player: A, modes: [0] })).not.toBeNull();
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(damage(game, giant)).toBe(2);
    expect(damage(game, kite)).toBe(0);
    expect(energy(game)).toBe(0);
  });

  it("Territorial Aetherkite declined deals nothing and keeps the energy", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Territorial Aetherkite", A, { settle: false });
    modesOffer(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [] });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(energy(game)).toBe(2);
  });
});

describe("an alternative cost paid in energy (alternativeCostForSpells.energy)", () => {
  const altCasts = (game: Game, card: ObjectId) =>
    game
      .legalActions(A)
      .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card && a.altCost === true);

  it("Nissa, Worldsoul Speaker casts a permanent spell for eight {E}, no mana", () => {
    const { game } = table();
    spawn(game, "Nissa, Worldsoul Speaker");
    const dragon = toHand(game, "Shivan Dragon");
    const bolt = toHand(game, "Lightning Bolt");
    game.state.players[A].energy = 7;
    expect(altCasts(game, dragon)).toEqual([]);
    game.state.players[A].energy = 8;
    expect(altCasts(game, dragon).map((a) => a.altCostText)).toEqual(["pay {E}{E}{E}{E}{E}{E}{E}{E}"]);
    expect(altCasts(game, bolt)).toEqual([]);
    cast(game, dragon, { altCost: true });
    expect(zone(game, dragon)).toBe("battlefield");
    expect(energy(game)).toBe(0);
  });

  it("Nissa's landfall gets two {E}", () => {
    const { game } = table();
    spawn(game, "Nissa, Worldsoul Speaker");
    enter(game, "Forest");
    expect(energy(game)).toBe(2);
  });

  it("Primal Prayers casts a small creature for one {E}, as though it had flash", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Primal Prayers");
    game.state.players[A].energy = 1;
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    lands(game, "Mountain", 4);
    // At upkeep: only the energy cast, and not for a mana value 4 creature.
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [] })).not.toBeNull();
    expect(altCasts(game, giant)).toEqual([]);
    expect(altCasts(game, bears)).toHaveLength(1);
    cast(game, bears, { altCost: true });
    expect(zone(game, bears)).toBe("battlefield");
    expect(energy(game)).toBe(0);
  });

  it("Primal Prayers' enters trigger gets two {E}", () => {
    const { game } = table();
    enter(game, "Primal Prayers");
    expect(energy(game)).toBe(2);
  });
});

describe("cast-now byPayingEnergy (Amped Raptor)", () => {
  function raptor(top: string, opts: { energy?: number } = {}) {
    const t = table();
    const { game } = t;
    lands(game, "Mountain", 2);
    toLibrary(game, top);
    toLibrary(game, "Mountain");
    if (opts.energy !== undefined) game.state.players[A].energy = opts.energy;
    cast(game, toHand(game, "Amped Raptor"), { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "cast-now" || (s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0));
    return t;
  }

  it("exiles to a nonland card and casts it for energy equal to its mana value", () => {
    const { game } = raptor("Grizzly Bears");
    expect(game.state.awaiting?.kind).toBe("cast-now");
    const offer = game.legalActions(A).find((a) => a.kind === "cast-now");
    expect(offer?.kind === "cast-now" && offer.byPayingEnergy).toBe(true);
    const bears = game.state.awaiting?.kind === "cast-now" ? game.state.awaiting.cards[0] : undefined;
    if (bears === undefined) throw new Error("no card");
    game.dispatch({ type: "cast-now", player: A, cast: { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true } });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(energy(game)).toBe(0);
    // The Mountain exiled on the way stays there.
    expect(game.state.zones.shared.exile.length).toBe(1);
  });

  it("offers nothing without the energy, and the card stays in exile", () => {
    const { game } = raptor("Hill Giant");
    expect(game.state.awaiting).toBeNull();
    const giant = Object.values(game.state.objects).find((o) => o.cardName === "Hill Giant");
    expect(giant?.zone).toBe("exile");
    expect(energy(game)).toBe(2);
  });

  it("doesn't exile when it wasn't cast from a hand", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears");
    enter(game, "Amped Raptor");
    expect(energy(game)).toBe(2);
    expect(game.state.zones.shared.exile.length).toBe(0);
  });
});

describe("a may's costEnergy read from a graveyard card (Jolted Awake)", () => {
  it("returns the card for energy equal to its mana value", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Jolted Awake"), { targets: [ref(bears)], settle: false });
    modesOffer(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(energy(game)).toBe(0);
  });

  it("isn't offered when the card costs more energy than there is", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Jolted Awake"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(energy(game)).toBe(2);
  });

  it("with no target, still gets the energy", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Jolted Awake"), { targets: [null] });
    expect(energy(game)).toBe(2);
  });
});
