/**
 * "Becomes the target" for players as well as permanents (rule 115.7 —
 * `player-targeted`, once per player a spell or ability names): you alone
 * (Amulet of Safekeeping, Dormant Gomazoa), you or a permanent you control
 * (Unsettled Mariner), any player or permanent by an ability you control
 * (Loki, God of Mischief); and "for the first time each turn" counted over
 * every player's spells and abilities (Angelic Cub).
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, hand, keywords, lands, life, nextTurn, pickModes, pt, ref, spawn, table, toHand, zone } from "./harness.js";

describe("you becoming a target", () => {
  it("Amulet of Safekeeping counters an opponent's Shock at you unless they pay {1}, not one at your creature", () => {
    const { game } = table();
    spawn(game, "Amulet of Safekeeping");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, shock)).toBe("graveyard");
    // At a creature: no trigger.
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Amulet of Safekeeping: creature tokens get -1/-0", () => {
    const { game } = table();
    spawn(game, "Amulet of Safekeeping");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    const token = game.battlefield.find((id) => game.state.objects[id].isToken === true)!;
    expect(pt(game, token)).toEqual({ power: 0, toughness: 1 });
    // A nontoken creature is untouched.
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Unsettled Mariner: you or a permanent you control, an opponent's only", () => {
    const { game } = table();
    spawn(game, "Unsettled Mariner");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's
    lands(game, "Mountain", 2, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    nextTurn(game); // alice's own Shock at herself: no trigger
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
  });

  it("Dormant Gomazoa untaps when you become the target of a spell, not of an ability", () => {
    const { game, a } = table();
    pickModes(a, 0); // "you may untap": yes
    const gomazoa = spawn(game, "Dormant Gomazoa", A, { tapped: true });
    const pyromancer = spawn(game, "Prodigal Pyromancer", B);
    nextTurn(game); // bob's
    activate(game, pyromancer, 0, { player: B, targets: [ref(A)] });
    expect(game.state.objects[gomazoa].tapped).toBe(true);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(game.state.objects[gomazoa].tapped).toBe(false);
  });
});

describe("a player or permanent targeted by an ability you control", () => {
  it("Loki draws once a turn, for an ability's target — a player or a permanent — never a spell's", () => {
    const { game } = table();
    spawn(game, "Loki, God of Mischief");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    lands(game, "Mountain", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before);
    activate(game, pyromancer, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 1);
    // Once each turn.
    const second = spawn(game, "Prodigal Pyromancer");
    activate(game, second, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 1);
    // An opponent's ability targeting your permanent isn't yours.
    nextTurn(game);
    const bobs = spawn(game, "Prodigal Pyromancer", B);
    activate(game, bobs, 0, { player: B, targets: [ref(pyromancer)] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("the first time each turn, by anyone", () => {
  it("Angelic Cub: a counter for the turn's first targeting, whoever's; flying at three", () => {
    const { game } = table();
    const cub = spawn(game, "Angelic Cub");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(cub)] });
    expect(counters(game, cub)).toBe(1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(cub)] });
    expect(counters(game, cub)).toBe(1);
    nextTurn(game); // bob's: the first by anyone this turn
    const pyromancer = spawn(game, "Prodigal Pyromancer", B);
    activate(game, pyromancer, 0, { player: B, targets: [ref(cub)] });
    expect(counters(game, cub)).toBe(2);
    nextTurn(game);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(cub)] });
    expect(counters(game, cub)).toBe(3);
    expect(keywords(game, cub).has("flying")).toBe(true);
  });
});
