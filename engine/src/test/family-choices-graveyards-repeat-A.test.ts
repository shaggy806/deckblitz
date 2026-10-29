/**
 * B251 group A: cards freed by the single-graveyard and that-player's-graveyard target relations —
 * Cease, Goblin Welder, Misinformation, Pull, Rite of Renewal, Lochmere Serpent, Qutrub Forayer,
 * Nullmage Advocate, Pestilent Cauldron.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("targets from one graveyard, or one player's", () => {
  it("Cease: two cards from one graveyard, then the target player gains 2 life and draws", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bobs = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const card = toHand(game, "Cease // Desist");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card, face: 1, targets: [ref(B), ref(bobs[0]), ref(mine)] }),
    ).not.toBeNull();
    const before = hand(game, B).length;
    cast(game, card, { face: 1, targets: [ref(B), ...bobs.map(ref)] });
    expect(bobs.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(zone(game, mine)).toBe("graveyard");
    expect(life(game, B)).toBe(22);
    expect(hand(game, B)).toHaveLength(before + 1);
  });

  it("Goblin Welder: swaps an artifact for an artifact card in its controller's graveyard, not another's", () => {
    const { game } = table();
    const welder = spawn(game, "Goblin Welder");
    const ring = spawn(game, "Sol Ring", B);
    const bobsThopter = toGraveyard(game, "Ornithopter", B);
    const myThopter = toGraveyard(game, "Ornithopter", A);
    expect(
      game.canDispatch({
        type: "activate-ability",
        player: A,
        source: welder,
        abilityIndex: 0,
        targets: [ref(ring), ref(myThopter)],
      }),
    ).not.toBeNull();
    activate(game, welder, 0, { targets: [ref(ring), ref(bobsThopter)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bobsThopter)).toBe("battlefield");
    expect(controller(game, bobsThopter)).toBe(B);
    expect(zone(game, myThopter)).toBe("graveyard");
  });

  it("Goblin Welder: with the card gone in response, the artifact isn't sacrificed", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const welder = spawn(game, "Goblin Welder");
    const ring = spawn(game, "Sol Ring", B);
    const thopter = toGraveyard(game, "Ornithopter", B);
    activate(game, welder, 0, { targets: [ref(ring), ref(thopter)], settle: false });
    cast(game, toHand(game, "Misinformation"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("library");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("Misinformation: the cards go on top in the order chosen, the last on top", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const marker = toLibrary(game, "Hill Giant", B);
    const library = (): readonly string[] => game.state.zones.perPlayer[B].library;
    const topFirst = library()[0] === marker;
    const bobs = [
      toGraveyard(game, "Grizzly Bears", B),
      toGraveyard(game, "Hill Giant", B),
      toGraveyard(game, "Ornithopter", B),
    ];
    cast(game, toHand(game, "Misinformation"), { targets: bobs.map(ref) });
    const topThree = topFirst ? library().slice(0, 3) : library().slice(-3).reverse();
    expect(topThree).toEqual([bobs[2], bobs[1], bobs[0]]);
  });

  it("Pull: two creature cards from one graveyard enter under you with haste, then are sacrificed at the end step", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 6);
    const bobs = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    const carols = toGraveyard(game, "Grizzly Bears", C);
    const card = toHand(game, "Push // Pull");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card, face: 2, targets: [ref(bobs[0]), ref(carols)] }),
    ).not.toBeNull();
    cast(game, card, { face: 2, targets: bobs.map(ref) });
    expect(bobs.map((id) => controller(game, id))).toEqual([A, A]);
    expect(bobs.map((id) => keywords(game, id).has("haste"))).toEqual([true, true]);
    nextTurn(game);
    expect(bobs.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(graveyard(game, B)).toEqual(expect.arrayContaining(bobs));
  });

  it("Rite of Renewal: two permanent cards back, the target player's cards into their library, Rite exiled", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const mine = [toGraveyard(game, "Grizzly Bears", A), toGraveyard(game, "Sol Ring", A)];
    const myGiant = toGraveyard(game, "Hill Giant", A);
    const bobs = [toGraveyard(game, "Hill Giant", B), toGraveyard(game, "Ornithopter", B)];
    const rite = toHand(game, "Rite of Renewal");
    expect(
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card: rite,
        targets: [ref(mine[0]), ref(mine[1]), ref(B), ref(myGiant)],
      }),
    ).not.toBeNull();
    cast(game, rite, { targets: [ref(mine[0]), ref(mine[1]), ref(B), ...bobs.map(ref)] });
    expect(mine.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
    expect(bobs.map((id) => zone(game, id))).toEqual(["library", "library"]);
    expect(zone(game, myGiant)).toBe("graveyard");
    expect(zone(game, rite)).toBe("exile");
  });

  it("Lochmere Serpent: from your graveyard, five cards from one opponent's graveyard, and it returns to hand", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const serpent = toGraveyard(game, "Lochmere Serpent");
    const bobs = Array.from({ length: 5 }, () => toGraveyard(game, "Grizzly Bears", B));
    const carols = toGraveyard(game, "Grizzly Bears", C);
    expect(
      game.canDispatch({
        type: "activate-ability",
        player: A,
        source: serpent,
        abilityIndex: 2,
        targets: [...bobs.slice(0, 4).map(ref), ref(carols)],
      }),
    ).not.toBeNull();
    activate(game, serpent, 2, { targets: bobs.map(ref) });
    expect(bobs.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(zone(game, serpent)).toBe("hand");
  });

  it("Qutrub Forayer: the exile mode takes two cards from one graveyard", () => {
    const { game, a } = table();
    const bobs = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    // No creature was dealt damage, so only the exile mode is offered (rule 700.2a).
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      return [0];
    };
    pickTargets(a, bobs[0], bobs[1]);
    enter(game, "Qutrub Forayer");
    expect(asked).toEqual([["Exile up to two target cards from a single graveyard."]]);
    expect(bobs.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
  });

  it("Nullmage Advocate: both cards from one opponent's graveyard back to their hand, and the artifact destroyed", () => {
    const { game } = table({ players: 3 });
    const advocate = spawn(game, "Nullmage Advocate");
    const ring = spawn(game, "Sol Ring", C);
    const bobs = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    const carols = toGraveyard(game, "Grizzly Bears", C);
    expect(
      game.canDispatch({
        type: "activate-ability",
        player: A,
        source: advocate,
        abilityIndex: 0,
        targets: [ref(ring), ref(bobs[0]), ref(carols)],
      }),
    ).not.toBeNull();
    activate(game, advocate, 0, { targets: [ref(ring), ...bobs.map(ref)] });
    expect(bobs.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
    expect(hand(game, B)).toEqual(expect.arrayContaining(bobs));
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("Pestilent Cauldron: each opponent mills as many cards as the life you gained this turn", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    spawn(game, "Soul Warden");
    enter(game, "Grizzly Bears");
    enter(game, "Hill Giant");
    expect(life(game, A)).toBe(22);
    const cauldron = spawn(game, "Pestilent Cauldron");
    const before = graveyard(game, B).length;
    activate(game, cauldron, 1);
    expect(graveyard(game, B)).toHaveLength(before + 2);
  });
});
