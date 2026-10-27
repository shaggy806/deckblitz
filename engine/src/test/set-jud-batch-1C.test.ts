/**
 * Judgment (JUD; B217) — group C: the Phantoms' prevention, threshold cards,
 * discard triggers, a Wormfang's linked exile and a punisher choice.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const fillGraveyard = (game: Parameters<typeof spawn>[0], n: number): void => {
  for (let i = 0; i < n; i++) toGraveyard(game, "Wastes");
};

describe("Dwarven Scorcher", () => {
  it("the target's controller may take 2 damage to spare the creature", () => {
    const { game, b } = table();
    const scorcher = spawn(game, "Dwarven Scorcher");
    const elves = spawn(game, "Llanowar Elves", B);
    b.chooseModesFn = () => [0];
    activate(game, scorcher, 0, { targets: [ref(elves)] });
    expect(zone(game, scorcher)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("or let the creature take 1", () => {
    const { game, b } = table();
    const scorcher = spawn(game, "Dwarven Scorcher");
    const elves = spawn(game, "Llanowar Elves", B);
    b.chooseModesFn = () => [1];
    activate(game, scorcher, 0, { targets: [ref(elves)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Phantom Nishoba", () => {
  it("enters with seven counters; damage to it is prevented and costs one counter", () => {
    const { game } = table();
    const nishoba = enter(game, "Phantom Nishoba");
    expect(counters(game, nishoba)).toBe(7);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(nishoba)]);
    settle(game);
    expect(counters(game, nishoba)).toBe(6);
    expect(game.state.objects[nishoba].damageMarked).toBe(0);
  });

  it("gains life equal to the damage it deals", () => {
    const { game } = table();
    const nishoba = enter(game, "Phantom Nishoba");
    game.debugApplyEffect(A, { kind: "damage", amount: 7, target: 0 }, [ref(B)], { source: nishoba });
    settle(game);
    expect(life(game, A)).toBe(27);
  });
});

describe("Phantom Nantuko", () => {
  it("prevents damage and loses a counter; taps for a counter", () => {
    const { game } = table();
    const nantuko = enter(game, "Phantom Nantuko");
    expect(counters(game, nantuko)).toBe(2);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(nantuko)]);
    settle(game);
    expect(counters(game, nantuko)).toBe(1);
    expect(zone(game, nantuko)).toBe("battlefield");
    activate(game, nantuko, 0);
    expect(counters(game, nantuko)).toBe(2);
  });
});

describe("Nantuko Monastery", () => {
  it("animates only with threshold, as a 4/4 green and white first striker", () => {
    const { game } = table();
    const monastery = spawn(game, "Nantuko Monastery");
    spawn(game, "Forest");
    spawn(game, "Plains");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: monastery, abilityIndex: 1, targets: [] })).not.toBeNull();
    fillGraveyard(game, 7);
    activate(game, monastery, 1);
    expect(pt(game, monastery)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Spirit Cairn", () => {
  it("each card an opponent discards offers a Spirit for {W}", () => {
    const { game, a } = table();
    spawn(game, "Spirit Cairn");
    spawn(game, "Plains");
    spawn(game, "Plains");
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 2 }, [ref(B)]);
    settle(game);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });
});

describe("Exoskeletal Armor", () => {
  it("counts creature cards in every graveyard", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves", A);
    toGraveyard(game, "Llanowar Elves", B);
    toGraveyard(game, "Wastes", B);
    spawn(game, "Forest");
    spawn(game, "Forest");
    const armor = toHand(game, "Exoskeletal Armor");
    pickTargets(a, bears);
    cast(game, armor, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Wormfang Newt", () => {
  it("exiles a land you control and returns it when it leaves", () => {
    const { game, a } = table();
    const island = spawn(game, "Island");
    pickPermanents(a, island);
    const newt = enter(game, "Wormfang Newt");
    expect(zone(game, island)).toBe("exile");
    destroy(game, newt);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Island");
    expect(back).toBeDefined();
  });
});

describe("Toxic Stench", () => {
  it("gives -1/-1 without threshold", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Swamp");
    spawn(game, "Swamp");
    cast(game, toHand(game, "Toxic Stench"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });

  it("destroys the creature with threshold", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Swamp");
    spawn(game, "Swamp");
    fillGraveyard(game, 7);
    cast(game, toHand(game, "Toxic Stench"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Telekinetic Bonds", () => {
  it("pays {1}{U} to tap the targeted permanent when a player discards", () => {
    const { game, a } = table();
    spawn(game, "Telekinetic Bonds");
    spawn(game, "Island");
    spawn(game, "Island");
    const bears = spawn(game, "Grizzly Bears", B);
    toHand(game, "Wastes", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 1 }, [ref(B)]);
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Masked Gorgon", () => {
  it("green creatures have protection from Gorgons; with threshold it has protection from green", () => {
    const { game } = table();
    const gorgon = spawn(game, "Masked Gorgon");
    const elves = spawn(game, "Llanowar Elves", B);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(elves)], { source: gorgon });
    settle(game);
    expect(zone(game, elves)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(gorgon)], { source: elves });
    expect(game.state.objects[gorgon].damageMarked).toBe(2);
    fillGraveyard(game, 7);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(gorgon)], { source: elves });
    expect(game.state.objects[gorgon].damageMarked).toBe(2);
  });
});

describe("Treacherous Werewolf", () => {
  it("with threshold it's 4/4 and its death costs 4 life", () => {
    const { game } = table();
    const wolf = spawn(game, "Treacherous Werewolf");
    fillGraveyard(game, 7);
    expect(pt(game, wolf)).toEqual({ power: 4, toughness: 4 });
    destroy(game, wolf);
    expect(life(game, A)).toBe(16);
  });

  it("dying with six cards in the graveyard doesn't count itself", () => {
    const { game } = table();
    const wolf = spawn(game, "Treacherous Werewolf");
    fillGraveyard(game, 6);
    destroy(game, wolf);
    expect(graveyard(game).length).toBe(7);
    expect(life(game, A)).toBe(20);
  });
});
