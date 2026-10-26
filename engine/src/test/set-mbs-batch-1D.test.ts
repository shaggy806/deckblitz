import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";
import type { ObjectId } from "../primitives.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("MBS batch 1D", () => {
  it("Hero of Oxid Ridge: creatures with power 1 or less can't block", () => {
    const { game, a } = table();
    const hero = spawn(game, "Hero of Oxid Ridge", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    const offer = blockOffer(game, a, [hero]);
    expect(canBlock(offer, bears)).toEqual([hero]);
    expect(canBlock(offer, thopter)).toEqual([]);
  });

  it("Victory's Herald: attacking creatures gain flying and lifelink", () => {
    const { game, a } = table();
    const herald = spawn(game, "Victory's Herald", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const stay = spawn(game, "Grizzly Bears", A);
    a.declareAttackersFn = () => [herald, bears].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, stay).has("lifelink")).toBe(false);
  });

  it("Galvanoth casts the top instant free in upkeep", () => {
    const { game, a } = table();
    spawn(game, "Galvanoth", A);
    nextTurn(game);
    const bolt = toLibrary(game, "Lightning Bolt", A);
    pickFromZone(a, bolt);
    a.chooseCastNowFn = (_v, offer) =>
      offer.casts.length === 0
        ? null
        : { type: "cast-spell", player: A, card: offer.cards[0], targets: [{ kind: "player", player: B }], via: "effect", free: true };
    toStep(game, "upkeep", A);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("Galvanoth leaves a non-instant on top", () => {
    const { game, a } = table();
    spawn(game, "Galvanoth", A);
    const bears = toLibrary(game, "Grizzly Bears", A);
    const seen = pickFromZone(a);
    toStep(game, "upkeep", A);
    settle(game);
    expect(seen.offered).toEqual([]);
    expect(zone(game, bears)).toBe("library");
  });

  it("Tezzeret: −1 animates an artifact 5/5; −4 drains twice the artifacts", () => {
    const { game } = table();
    const tez = spawn(game, "Tezzeret, Agent of Bolas", A);
    game.state.objects[tez].counters.loyalty = 9;
    spawn(game, "Ornithopter", A);
    const web = spawn(game, "Decimator Web", A);
    loyalty(game, tez, -1, { targets: [{ kind: "object", object: web }] });
    expect(types(game, web)).toContain("creature");
    expect(pt(game, web)).toEqual({ power: 5, toughness: 5 });
    toStep(game, "precombat-main", A);
    loyalty(game, tez, -4, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("Decimator Web: loses 2, a poison counter, mills six", () => {
    const { game, a } = table();
    const web = spawn(game, "Decimator Web", A);
    lands(game, "Wastes", 4);
    pickTargets(a, B);
    activate(game, web, 0, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(18);
    expect(game.state.players[B].counters.poison).toBe(1);
    expect(graveyard(game, B).length).toBe(6);
  });

  it("Dispense Justice: two attackers with metalcraft", () => {
    const { game, b } = table();
    spawn(game, "Ornithopter", A);
    spawn(game, "Ornithopter", A);
    spawn(game, "Memnite", A);
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    lands(game, "Plains", 3, A);
    // Bob attacks with all three on his turn.
    toStep(game, "precombat-main", B);
    b.declareAttackersFn = () => bears.map((attacker) => ({ attacker, defender: A }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.zones.shared.stack.length === 0);
    pickPermanents(b, bears[0], bears[1]);
    cast(game, toHand(game, "Dispense Justice", A), { targets: [{ kind: "player", player: B }] });
    expect(bears.filter((x) => zone(game, x) === "graveyard").length).toBe(2);
  });

  it("Hand of the Praetors: casting an infect creature poisons; others get +1/+1", () => {
    const { game, a } = table();
    spawn(game, "Hand of the Praetors", A);
    const handBefore = hand(game, A).length;
    lands(game, "Wastes", 2);
    pickTargets(a, B);
    const necro = toHand(game, "Necropede", A);
    cast(game, necro);
    expect(game.state.players[B].counters.poison).toBe(1);
    expect(pt(game, necro)).toEqual({ power: 2, toughness: 2 });
    expect(hand(game, A).length).toBe(handBefore);
  });

  it("Spiraling Duelist and Spire Serpent with metalcraft", () => {
    const { game } = table();
    const duelist = spawn(game, "Spiraling Duelist", A);
    const serpent = spawn(game, "Spire Serpent", A);
    expect(keywords(game, duelist).has("double-strike")).toBe(false);
    expect(pt(game, serpent)).toEqual({ power: 3, toughness: 5 });
    spawn(game, "Ornithopter", A);
    spawn(game, "Ornithopter", A);
    spawn(game, "Memnite", A);
    expect(keywords(game, duelist).has("double-strike")).toBe(true);
    expect(pt(game, serpent)).toEqual({ power: 5, toughness: 7 });
  });

  it("Acid Web Spider may destroy target Equipment", () => {
    const { game, a } = table();
    const carapace = spawn(game, "Copper Carapace", B);
    pickTargets(a, carapace);
    pickModes(a, 0);
    enter(game, "Acid Web Spider", A);
    expect(zone(game, carapace)).toBe("graveyard");
  });
});
