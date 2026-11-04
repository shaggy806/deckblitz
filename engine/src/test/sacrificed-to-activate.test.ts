/**
 * Attributing a sacrifice paid as a cost to the right ability and permanent:
 * Ashnod the Uncaring's "if one or more permanents were sacrificed to activate
 * it" reads the activated ability's own cost, and Toggo's Rock is sacrificed
 * from the creature it grants the ability to (`sacrifice: "granter"`, rule
 * 201.5a).
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, enter, lands, pickModes, settle, spawn, table } from "./harness.js";

describe("Ashnod the Uncaring", () => {
  it("copies an artifact's ability whose cost sacrificed itself (rule 113.7a)", () => {
    const { game, a } = table();
    spawn(game, "Ashnod the Uncaring");
    lands(game, "Wastes", 2);
    const clue = spawn(game, "Clue Token");
    const hand = game.handOf(A).length;
    pickModes(a, 0);
    activate(game, clue, 0);
    expect(game.handOf(A).length).toBe(hand + 2);
  });

  it("copies one that sacrificed something else, an effect of a creature's own cost", () => {
    const { game, a } = table();
    spawn(game, "Ashnod the Uncaring");
    const outlet = spawn(game, "Mogg Fanatic");
    const life = game.state.players[B].life;
    pickModes(a, 0);
    activate(game, outlet, 0, { targets: [{ kind: "player", player: B }] });
    expect(game.state.players[B].life).toBe(life - 2);
  });

  it("sees a cost of several, chosen after the ability is on the stack", () => {
    const { game, a } = table();
    spawn(game, "Ashnod the Uncaring");
    const sai = spawn(game, "Sai, Master Thopterist");
    lands(game, "Island", 2);
    const relics = [spawn(game, "Mind Stone"), spawn(game, "Mind Stone")];
    const hand = game.handOf(A).length;
    pickModes(a, 0);
    activate(game, sai, 0);
    for (const relic of relics) expect(game.state.objects[relic].zone).toBe("graveyard");
    expect(game.handOf(A).length).toBe(hand + 2);
  });

  it("isn't asked for an ability that sacrificed nothing", () => {
    const { game, a } = table();
    spawn(game, "Ashnod the Uncaring");
    const tome = spawn(game, "Jayemdae Tome");
    lands(game, "Wastes", 4);
    const hand = game.handOf(A).length;
    pickModes(a, 0);
    activate(game, tome, 0);
    expect(game.handOf(A).length).toBe(hand + 1);
  });

  it("isn't fooled by a Treasure sacrificed for the mana (the ruling)", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Ashnod the Uncaring");
    const tome = spawn(game, "Jayemdae Tome");
    lands(game, "Wastes", 3);
    const treasure = spawn(game, "Treasure Token");
    const hand = game.handOf(A).length;
    activate(game, tome, 0, { settle: false });
    expect(game.state.objects[treasure]?.zone).not.toBe("battlefield");
    expect(game.state.zones.shared.stack).toHaveLength(1);
    settle(game);
    expect(game.handOf(A).length).toBe(hand + 1);
  });

  it("doesn't see a land's ability, sacrificed or not", () => {
    const { game } = table();
    spawn(game, "Ashnod the Uncaring");
    const wilds = spawn(game, "Evolving Wilds");
    activate(game, wilds, 0, { settle: false });
    expect(game.state.zones.shared.stack).toHaveLength(1);
  });

  it("doesn't see an opponent's", () => {
    const { game, b } = table();
    spawn(game, "Ashnod the Uncaring", B);
    const fanatic = spawn(game, "Mogg Fanatic");
    const life = game.state.players[B].life;
    pickModes(b, 0);
    activate(game, fanatic, 0, { targets: [{ kind: "player", player: B }] });
    expect(game.state.players[B].life).toBe(life - 1);
  });
});

describe("Toggo, Goblin Weaponsmith", () => {
  it("makes a Rock on landfall, which is sacrificed from the creature it equips", () => {
    const { game } = table();
    spawn(game, "Toggo, Goblin Weaponsmith");
    lands(game, "Wastes", 3);
    enter(game, "Mountain");
    const rock = game.battlefield.find((id) => game.state.objects[id].cardName === "Rock Token")!;
    expect(rock).toBeDefined();
    const bears = spawn(game, "Grizzly Bears");
    activate(game, rock, 0, { targets: [{ kind: "object", object: bears }] });
    expect(game.state.objects[rock].attachedTo).toBe(bears);
    const life = game.state.players[B].life;
    activate(game, bears, 0, { targets: [{ kind: "player", player: B }], settle: false });
    expect(game.state.objects[rock]?.zone).not.toBe("battlefield");
    settle(game);
    expect(game.state.players[B].life).toBe(life - 2);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("and Ashnod copies that ability: Rock was sacrificed to activate it", () => {
    const { game, a } = table();
    spawn(game, "Ashnod the Uncaring");
    lands(game, "Wastes", 2);
    const rock = spawn(game, "Rock Token");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, rock, 0, { targets: [{ kind: "object", object: bears }] });
    const life = game.state.players[B].life;
    pickModes(a, 0);
    activate(game, bears, 0, { targets: [{ kind: "player", player: B }] });
    expect(game.state.players[B].life).toBe(life - 4);
  });
});
