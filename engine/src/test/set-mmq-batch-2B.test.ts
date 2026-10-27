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
  graveyard,
  hand,
  lands,
  life,
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

// Batch 233, group B: the rest of Mercadian Masques.

const altOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("MMQ batch 2B", () => {
  it("Insubordination: 2 damage at its controller's end step unless the creature attacked", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = game.debugSpawn("Insubordination", B, "battlefield");
    game.state.objects[aura].attachedTo = bears;
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });

  it("Insubordination: no damage once the enchanted creature attacked", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = game.debugSpawn("Insubordination", B, "battlefield");
    game.state.objects[aura].attachedTo = bears;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(20);
  });

  it("Rishadan Pawnshop: shuffles a nontoken permanent you control into its owner's library", () => {
    const { game, a } = table();
    const shop = spawn(game, "Rishadan Pawnshop");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: shop, abilityIndex: 0, targets: [ref(theirs)] })).not.toBeNull();
    pickTargets(a, bears);
    activate(game, shop, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("Bifurcate: puts a card with the target's name from your library onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const theirs = spawn(game, "Grizzly Bears", B);
    const copy = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, copy);
    cast(game, toHand(game, "Bifurcate"), { targets: [ref(theirs)] });
    expect(zone(game, copy)).toBe("battlefield");
    expect(game.state.objects[copy].controller).toBe(A);
  });

  it("Midnight Ritual: one Zombie per creature card exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")];
    cast(game, toHand(game, "Midnight Ritual"), { x: 2, targets: [ref(cards[0]), ref(cards[1])] });
    expect(zone(game, cards[0])).toBe("exile");
    expect(zone(game, cards[1])).toBe("exile");
    expect(zone(game, cards[2])).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
  });

  it("Rouse: 2 life instead of its cost, only with a Swamp", () => {
    const { game } = table();
    const rouse = toHand(game, "Rouse");
    const bears = spawn(game, "Grizzly Bears");
    expect(altOffers(game, rouse)).toHaveLength(0);
    spawn(game, "Swamp");
    game.state.objects[game.state.zones.shared.battlefield.at(-1)!].tapped = true;
    expect(altOffers(game, rouse)).toHaveLength(1);
    cast(game, rouse, { targets: [ref(bears)], altCost: true });
    expect(life(game, A)).toBe(18);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("Extortion: you choose up to two cards from their hand; they discard them", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const one = toHand(game, "Sol Ring", B);
    const two = toHand(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickFromZone(a, one, two);
    cast(game, toHand(game, "Extortion"), { targets: [ref(B)] });
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 2);
  });

  it("Blood Hound: counters for damage dealt to you, removed at your end step", () => {
    const { game, a } = table();
    const hound = spawn(game, "Blood Hound");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(counters(game, hound)).toBe(3);
    expect(pt(game, hound)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "end");
    settle(game);
    expect(counters(game, hound)).toBe(0);
  });

  it("Cackling Witch: X from the activation, a card discarded", () => {
    const { game, a } = table();
    const witch = spawn(game, "Cackling Witch");
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const fodder = toHand(game, "Sol Ring");
    a.chooseDiscardsFn = () => [fodder];
    activate(game, witch, 0, { x: 3, targets: [ref(bears)] });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });

  it("Lithophage: only a Mountain keeps it", () => {
    const { game } = table();
    const phage = spawn(game, "Lithophage");
    spawn(game, "Swamp");
    toStep(game, "upkeep", B);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, phage)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(phage);
  });
});
