/**
 * Onslaught (ONS) batch 2, group E: Prowling Pangolin's two-creature sacrifice offer, Goblin
 * Pyromancer's pump and end-step wipe, Flamestick Courier's while-tapped
 * grant, Death Pulse's cycle trigger, Airdrop Condor's Goblin sacrifice and
 * Grassland Crusader's Elf-or-Soldier target.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  enter,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Prowling Pangolin", () => {
  it("is sacrificed when a player sacrifices two creatures", () => {
    const { game, a, b } = table();
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickModes(b, 0);
    b.chooseSacrificesFn = () => [x, y];
    const pangolin = enter(game, "Prowling Pangolin");
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
    expect(zone(game, pangolin)).toBe("graveyard");
  });

  it("stays when no one sacrifices", () => {
    const { game, a, b } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickModes(b);
    const pangolin = enter(game, "Prowling Pangolin");
    expect(zone(game, pangolin)).toBe("battlefield");
  });
});

describe("Goblin Pyromancer", () => {
  it("pumps every Goblin, then destroys all Goblins at the end step", () => {
    const { game } = table();
    const theirs = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears");
    const pyro = enter(game, "Goblin Pyromancer");
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 1 });
    expect(pt(game, pyro)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.advanceUntil((s) => s.turn.step === "cleanup" || s.turn.number > 1);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, pyro)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Flamestick Courier", () => {
  it("gives a Goblin +2/+2 and haste while it stays tapped", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const courier = spawn(game, "Flamestick Courier");
    const goblin = spawn(game, "Raging Goblin");
    activate(game, courier, 0, { targets: [ref(goblin)] });
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, goblin).has("haste")).toBe(true);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(courier)]);
    settle(game);
    expect(pt(game, goblin)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Death Pulse", () => {
  it("cycled, may give target creature -1/-1", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const elf = spawn(game, "Llanowar Elves", B);
    const card = toHand(game, "Death Pulse");
    a.chooseTargetsFn = () => [ref(elf)];
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card });
    settle(game);
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("Airdrop Condor", () => {
  it("sacrifices a Goblin to deal its power to any target", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const condor = spawn(game, "Airdrop Condor");
    const goblin = spawn(game, "Goblin Piker"); // 2/1
    game.dispatch({ type: "activate-ability", player: A, source: condor, abilityIndex: 0, targets: [ref(B)], sacrifice: goblin });
    settle(game);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Grassland Crusader", () => {
  it("targets only Elf or Soldier creatures", () => {
    const { game } = table();
    const crusader = spawn(game, "Grassland Crusader");
    const elf = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const act = (t: typeof elf) =>
      game.canDispatch({ type: "activate-ability", player: A, source: crusader, abilityIndex: 0, targets: [ref(t)] });
    expect(act(bears)).not.toBeNull();
    expect(act(crusader)).toBeNull();
    activate(game, crusader, 0, { targets: [ref(elf)] });
    expect(pt(game, elf)).toEqual({ power: 3, toughness: 3 });
  });
});
