/**
 * Batch 255's cards the scaffolder finished, the ones whose correctness rests
 * on more than a line's template: an opponent's "its controller" after the
 * thing has left, an exile short of cards in hand, the pile fates, and the
 * replacement on what a source damaged.
 */
import { describe, expect, it } from "vitest";

import { defendersForAttacker } from "../combat/eligibility.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("its controller, after it has left", () => {
  it("Dream Fracture: the countered spell's controller draws, then you do", () => {
    const { game } = table();
    lands(game, "Forest", 2, B);
    lands(game, "Island", 3);
    toStep(game, "precombat-main", B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B, settle: false });
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    game.dispatch({ type: "pass-priority", player: B });
    const fracture = toHand(game, "Dream Fracture");
    cast(game, fracture, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(handB + 1);
    expect(hand(game, A).length).toBe(handA + 1);
  });

  it("Desecrated Earth: the destroyed land's controller discards", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const island = spawn(game, "Island", B);
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    cast(game, toHand(game, "Desecrated Earth"), { targets: [ref(island)] });
    settle(game);
    expect(zone(game, island)).toBe("graveyard");
    expect(hand(game, B).length).toBe(handB - 1);
    expect(hand(game, A).length).toBe(handA);
  });

  it("Introduction to Annihilation: the exiled permanent's controller draws", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const handB = hand(game, B).length;
    cast(game, toHand(game, "Introduction to Annihilation"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, B).length).toBe(handB + 1);
  });
});

describe("exiling from a hand", () => {
  it("Vessel of Malignity: two cards, or all they have when they have one", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const [only, ...others] = hand(game, B);
    for (const id of others) game.debugMove(id, "library");
    const vessel = spawn(game, "Vessel of Malignity");
    const seen = pickFromZone(b, only);
    activate(game, vessel, 0, { targets: [ref(B)] });
    expect(zone(game, vessel)).toBe("graveyard");
    expect(seen.offered).toEqual([only]);
    expect(zone(game, only)).toBe("exile");
    expect(hand(game, B).length).toBe(0);
  });

  it("Vessel of Malignity: their two, of their choice, from a full hand", () => {
    const { game, b } = table();
    lands(game, "Swamp", 2);
    const [one, two, ...others] = hand(game, B);
    const vessel = spawn(game, "Vessel of Malignity");
    pickFromZone(b, one, two);
    activate(game, vessel, 0, { targets: [ref(B)] });
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    for (const id of others) expect(zone(game, id)).toBe("hand");
  });

  it("Castigate: you choose, and a land isn't on offer", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const land = toHand(game, "Forest", B);
    const bears = toHand(game, "Grizzly Bears", B);
    let offered: readonly unknown[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [bears];
    };
    cast(game, toHand(game, "Castigate"), { targets: [ref(B)] });
    expect(offered).toContain(bears);
    expect(offered).not.toContain(land);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, land)).toBe("hand");
  });
});

describe("piles", () => {
  it("Do or Die: their pick is destroyed, the other pile stays", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    a.separatePilesFn = () => [[one], [two]];
    b.choosePileFn = () => 1;
    cast(game, toHand(game, "Do or Die"), { targets: [ref(B)] });
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, one)).toBe("battlefield");
  });

  it("Steam Augury: you separate, an opponent chooses, the pile goes to hand and the rest to the graveyard", () => {
    const { game, a, b } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    let piles: readonly (readonly string[])[] = [];
    a.separatePilesFn = (_view, offer) => {
      piles = [offer.objects.slice(0, 2), offer.objects.slice(2)];
      return [offer.objects.slice(0, 2), offer.objects.slice(2)];
    };
    b.choosePileFn = () => 0;
    const handBefore = hand(game, A).length;
    const graveBefore = graveyard(game, A).length;
    cast(game, toHand(game, "Steam Augury"));
    expect(piles.flat().length).toBe(5);
    // The spell itself goes to the graveyard too.
    expect(hand(game, A).length).toBe(handBefore + 2);
    expect(graveyard(game, A).length).toBe(graveBefore + 3 + 1);
  });
});

describe("what a source damaged", () => {
  it("Frostwielder: exiled if it damaged the creature this turn, and only then", () => {
    const { game } = table();
    const wielder = spawn(game, "Frostwielder");
    const pinged = spawn(game, "Llanowar Elves", B);
    activate(game, wielder, 0, { targets: [ref(pinged)] });
    expect(zone(game, pinged)).toBe("exile");
    const other = spawn(game, "Llanowar Elves", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("attacking only if the defender qualifies", () => {
  it("Chained Throatseeker: a poisoned player only, read for that player", () => {
    const { game } = table({ players: 3 });
    const seeker = spawn(game, "Chained Throatseeker");
    expect(defendersForAttacker(game.state, game.registry, A, seeker)).toEqual([]);
    game.state.players[C].counters.poison = 1;
    expect(defendersForAttacker(game.state, game.registry, A, seeker)).toEqual([C]);
  });

  it("Dandân: needs their Island, and goes when you control none", () => {
    const { game } = table();
    const myIsland = spawn(game, "Island");
    const dandan = enter(game, "Dandân");
    expect(defendersForAttacker(game.state, game.registry, A, dandan)).toEqual([]);
    spawn(game, "Island", B);
    expect(defendersForAttacker(game.state, game.registry, A, dandan)).toEqual([B]);
    expect(zone(game, dandan)).toBe("battlefield");
    expect(zone(game, myIsland)).toBe("battlefield");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Stone Rain"), { targets: [ref(myIsland)] });
    expect(zone(game, dandan)).toBe("graveyard");
  });
});

describe("switching power and toughness", () => {
  it("Valakut Fireboar attacks as a 7/1", () => {
    const { game, a, b } = table();
    const boar = spawn(game, "Valakut Fireboar");
    const before = life(game, B);
    b.declareBlockersFn = () => [];
    attack(game, a, [boar]);
    expect(life(game, B)).toBe(before - 7);
  });

  it("Crag Puca switches and switches back", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const puca = spawn(game, "Crag Puca");
    activate(game, puca);
    expect(pt(game, puca)).toEqual({ power: 4, toughness: 2 });
    activate(game, puca);
    expect(pt(game, puca)).toEqual({ power: 2, toughness: 4 });
  });

  it("Twisted Reflection: entwined, both modes on their own targets", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0, 1);
    cast(game, toHand(game, "Twisted Reflection"), {
      targets: [ref(giant), ref(bears)],
      modes: [0, 1],
      kicked: true,
    });
    expect(pt(game, giant).power).toBe(-3);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).size).toBe(0);
  });
});
