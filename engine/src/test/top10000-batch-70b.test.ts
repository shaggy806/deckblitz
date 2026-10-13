/**
 * Card batch 70, part b (2026-10-12): EDHREC ranks 7087–7128. Written on the
 * shared table in `harness.ts`.
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
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** The seat answers each `choose-modes` with the next of these, in order. */
function modesInOrder(seat: ScriptedController, ...answers: (readonly number[])[]): void {
  const queue = [...answers];
  seat.chooseModesFn = () => [...(queue.shift() ?? [])];
}

const energy = (game: Game, player = A): number => game.state.players[player].energy;

describe("Assaultron Dominator", () => {
  it("gets two energy, and an attacking artifact creature may take the counter of your choice for {E}", () => {
    const { game, a } = table();
    enter(game, "Assaultron Dominator");
    expect(energy(game)).toBe(2);
    const mite = spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    modesInOrder(a, [0], [1]); // pay {E}; a first strike counter
    attack(game, a, [mite, bears]);
    expect(counters(game, mite, "first-strike")).toBe(1);
    expect(counters(game, mite)).toBe(0);
    expect(energy(game)).toBe(1);
    // Grizzly Bears isn't an artifact: nothing triggered for it.
    expect(counters(game, bears, "first-strike")).toBe(0);
  });
});

describe("Dragon-Cursed Halls", () => {
  it("gives a creature a Treasure-making combat damage trigger until end of turn", () => {
    const { game, a } = table();
    const halls = spawn(game, "Dragon-Cursed Halls");
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, halls, 1, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Rienne, Angel of Rebirth", () => {
  it("pumps other multicolored creatures and returns one that died at the next end step", () => {
    const { game } = table();
    const rienne = spawn(game, "Rienne, Angel of Rebirth");
    const wolf = spawn(game, "Watchwolf"); // {G}{W} 3/3
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, wolf)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, rienne)).toEqual({ power: 5, toughness: 4 });
    destroy(game, wolf);
    destroy(game, bears);
    expect(zone(game, wolf)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, wolf)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("returns a multicolored creature that died at the same time as Rienne (the ruling)", () => {
    const { game } = table();
    const rienne = spawn(game, "Rienne, Angel of Rebirth");
    const wolf = spawn(game, "Watchwolf");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(zone(game, rienne)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, wolf)).toBe("hand");
    // Rienne herself is multicolored, but not "another".
    expect(zone(game, rienne)).toBe("graveyard");
  });
});

describe("Samut, Vizier of Naktamun", () => {
  it("draws only for a creature that entered this turn", () => {
    const { game, a } = table();
    spawn(game, "Samut, Vizier of Naktamun");
    const old = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main"); // alice's next turn
    const goblin = spawn(game, "Raging Goblin");
    const before = hand(game).length;
    attack(game, a, [old, goblin]);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Dimir Keyrune", () => {
  it("becomes a 2/2 blue and black unblockable Horror artifact creature", () => {
    const { game } = table();
    const keyrune = spawn(game, "Dimir Keyrune");
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    activate(game, keyrune, 1);
    expect(types(game, keyrune)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, keyrune)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, keyrune).has("unblockable")).toBe(true);
  });
});

describe("Mayael's Aria", () => {
  it("counts the new counters before asking for power 10 (the ruling)", () => {
    const { game } = table();
    spawn(game, "Mayael's Aria");
    const wurm = spawn(game, "Craw Wurm"); // 6/4
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(wurm)]);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, wurm)).toBe(4);
    expect(counters(game, bears)).toBe(1);
    expect(life(game, A)).toBe(30);
  });
});

describe("Static Prison", () => {
  it("exiles until it leaves, and is sacrificed once you stop paying {E}", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const prison = enter(game, "Static Prison");
    expect(zone(game, giant)).toBe("exile");
    expect(energy(game)).toBe(2);
    pickModes(a, 0); // pay {E}
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, prison)).toBe("battlefield");
    expect(energy(game)).toBe(1);
    pickModes(a); // don't
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, prison)).toBe("graveyard");
    expect(energy(game)).toBe(1);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
  });
});

describe("Too Greedily, Too Deep", () => {
  it("reanimates from any graveyard, and the creature deals its power to each other creature", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant", B); // 3/3
    const bears = spawn(game, "Grizzly Bears"); // 2/2
    const beetle = spawn(game, "Dune Beetle", B); // 1/4
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 5);
    cast(game, toHand(game, "Too Greedily, Too Deep"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].damageMarked).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, beetle)).toBe("battlefield");
    expect(game.state.objects[beetle].damageMarked).toBe(3);
  });
});

describe("Arcade Cabinet", () => {
  it("puts counters on up to four creatures, and doubles each kind of counter on one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    pickTargets(a, bears, lions, null, null);
    const cabinet = enter(game, "Arcade Cabinet");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, lions)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "flying", amount: 1 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    const treasure = game.battlefield.find((id) => game.state.objects[id].cardName === "Treasure Token")!;
    lands(game, "Wastes", 2);
    const action = {
      type: "activate-ability",
      player: A,
      source: cabinet,
      abilityIndex: 0,
      targets: [ref(bears)],
      sacrifice: treasure,
    } as const;
    const why = game.canDispatch(action);
    if (why !== null) throw new Error(why);
    game.dispatch(action);
    settle(game);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, bears, "flying")).toBe(2);
    expect(game.battlefield).not.toContain(treasure);
  });
});

describe("Zask, Skittering Swarmlord", () => {
  it("puts another Insect that died on the bottom, then mills two", () => {
    const { game } = table();
    spawn(game, "Zask, Skittering Swarmlord");
    const beetle = spawn(game, "Dune Beetle");
    const yard = graveyard(game).length;
    destroy(game, beetle);
    const library = game.state.zones.perPlayer[A].library;
    expect(zone(game, beetle)).toBe("library");
    expect(library[library.length - 1]).toBe(beetle);
    expect(graveyard(game).length).toBe(yard + 2);
  });

  it("lets you cast Insect spells, not others, from your graveyard", () => {
    const { game } = table();
    spawn(game, "Zask, Skittering Swarmlord");
    const beetle = toGraveyard(game, "Dune Beetle");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const offered = (card: ObjectId) =>
      game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === card && o.via === "graveyard-permission");
    expect(offered(beetle)).toBe(true);
    expect(offered(bears)).toBe(false);
  });
});

describe("Bramblewood Paragon", () => {
  it("gives other Warriors an extra counter, and creatures with counters trample", () => {
    const { game } = table();
    spawn(game, "Bramblewood Paragon");
    lands(game, "Forest", 4);
    const warrior = toHand(game, "Elvish Warrior");
    cast(game, warrior);
    expect(counters(game, warrior)).toBe(1);
    expect(keywords(game, warrior).has("trample")).toBe(true);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Clarion Spirit", () => {
  it("makes a Spirit for the second spell each turn only", () => {
    const { game } = table();
    spawn(game, "Clarion Spirit");
    cast(game, toHand(game, "Memnite"));
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    cast(game, toHand(game, "Memnite"));
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    cast(game, toHand(game, "Memnite"));
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});
