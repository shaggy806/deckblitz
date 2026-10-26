/**
 * Urza's Saga (USG; B193), group A. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Thran Turbine and Citanul Flute", () => {
  it("the upkeep mana can't cast a spell but pays the Flute's {X}, which finds a creature of mana value X or less", () => {
    const { game, a } = table();
    spawn(game, "Thran Turbine");
    const flute = spawn(game, "Citanul Flute");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    const pool = game.state.players[A].manaPool;
    expect(pool.map((u) => u.type)).toEqual(["C", "C"]);
    const drop = toHand(game, "Supply Drop");
    lands(game, "Wastes", 1);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: drop, targets: [] })).not.toBeNull();
    const before = hand(game).length;
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === bears);
    activate(game, flute, 0, { x: 2 });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.players[A].manaPool.length).toBe(0);
  });
});

describe("Planar Void", () => {
  it("exiles a card put into a graveyard, but not itself", () => {
    const { game } = table();
    const voidId = enter(game, "Planar Void");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(voidId)]);
    settle(game);
    expect(zone(game, voidId)).toBe("graveyard");
  });
});

describe("Goblin Cadets", () => {
  it("blocked, it goes to the target opponent and leaves combat", () => {
    const { game, a, b } = table();
    const cadets = spawn(game, "Goblin Cadets");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: cadets }];
    pickTargets(a, B);
    attack(game, a, [cadets]);
    expect(controller(game, cadets)).toBe(B);
    expect(zone(game, cadets)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Flesh Reaver", () => {
  it("combat damage to an opponent is dealt back to you", () => {
    const { game, a } = table();
    const reaver = spawn(game, "Flesh Reaver");
    attack(game, a, [reaver]);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(16);
  });
});

describe("Barrin's Codex", () => {
  it("draws one card per page counter it had as it was sacrificed", () => {
    const { game } = table();
    const codex = spawn(game, "Barrin's Codex");
    game.state.objects[codex].counters.page = 3;
    lands(game, "Wastes", 4);
    const before = hand(game).length;
    activate(game, codex);
    expect(zone(game, codex)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Befoul", () => {
  it("offers lands and nonblack creatures, not black creatures", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const land = spawn(game, "Forest", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const nighthawk = spawn(game, "Vampire Nighthawk", B);
    const befoul = toHand(game, "Befoul");
    const on = (id: typeof land) => game.canDispatch({ type: "cast-spell", player: A, card: befoul, targets: [ref(id)] });
    expect(on(bears)).toBeNull();
    expect(on(nighthawk)).not.toBeNull();
    cast(game, befoul, { targets: [ref(land)] });
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Fire Ants", () => {
  it("deals 1 to each other creature without flying", () => {
    const { game } = table();
    const ants = spawn(game, "Fire Ants");
    const elves = spawn(game, "Llanowar Elves", B);
    const birds = spawn(game, "Birds of Paradise", B);
    activate(game, ants);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, birds)).toBe("battlefield");
    expect(zone(game, ants)).toBe("battlefield");
  });
});

describe("Faith Healer", () => {
  it("gains life equal to the sacrificed enchantment's mana value", () => {
    const { game } = table();
    const healer = spawn(game, "Faith Healer");
    const anthem = spawn(game, "Glorious Anthem");
    game.dispatch({ type: "activate-ability", player: A, source: healer, abilityIndex: 0, targets: [], sacrifice: anthem });
    settle(game);
    expect(zone(game, anthem)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });
});

describe("Destructive Urge", () => {
  it("the player the enchanted creature hits sacrifices a land", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2, B);
    cast(game, toHand(game, "Destructive Urge"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(graveyard(game, B).length).toBe(1);
    expect(game.battlefield.filter((id) => controller(game, id) === B).length).toBe(1);
  });
});

describe("Thran Quarry", () => {
  it("is sacrificed at the end step while you control no creatures", () => {
    const { game } = table();
    const quarry = spawn(game, "Thran Quarry");
    toStep(game, "cleanup");
    expect(zone(game, quarry)).toBe("graveyard");
  });
});
