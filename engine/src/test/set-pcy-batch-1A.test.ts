import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  lands,
  named,
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
  toStep,
  zone,
} from "./harness.js";

// Prophecy (PCY), group A.

describe("Thrive", () => {
  it("puts one +1/+1 counter on each of X target creatures", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears", B);
    const third = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Thrive"), { x: 2, targets: [ref(bears), ref(other)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, other)).toBe(1);
    expect(counters(game, third)).toBe(0);
  });
});

describe("Keldon Firebombers", () => {
  it("leaves each player three lands, and a player with fewer keeps all of theirs", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    lands(game, "Forest", 2, B);
    enter(game, "Keldon Firebombers");
    expect(named(game, "Mountain", A)).toHaveLength(3);
    expect(named(game, "Forest", B)).toHaveLength(2);
  });
});

describe("Plague Fiend", () => {
  it("destroys the creature it damaged in combat unless its controller pays {2}", () => {
    const { game, a, b } = table();
    const fiend = spawn(game, "Plague Fiend");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: fiend }];
    pickModes(b);
    attack(game, a, [fiend]);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("paid for, the creature survives", () => {
    const { game, a, b } = table();
    const fiend = spawn(game, "Plague Fiend");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: fiend }];
    pickModes(b, 0);
    attack(game, a, [fiend]);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Soul Charmer", () => {
  it("gains 2 life unless the damaged creature's controller pays {2}", () => {
    const { game, a, b } = table();
    const charmer = spawn(game, "Soul Charmer");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: charmer }];
    pickModes(b);
    attack(game, a, [charmer]);
    expect(game.state.players[A].life).toBe(22);
  });
});

describe("Elephant Resurgence", () => {
  it("gives each player an Elephant counting the creature cards in its controller's graveyard, live", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Forest", B);
    cast(game, toHand(game, "Elephant Resurgence"));
    const [mine] = named(game, "Elephant Token (Graveyard Creatures)", A);
    const [theirs] = named(game, "Elephant Token (Graveyard Creatures)", B);
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 }); // the Resurgence itself isn't a creature
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Forgotten Harvest", () => {
  it("exiles a land card from your graveyard at upkeep to put a +1/+1 counter on the target creature", () => {
    const { game, a } = table();
    spawn(game, "Forgotten Harvest");
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    const seen = pickFromZone(a, forest);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("exile");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Keldon Battlewagon", () => {
  it("gets +X/+0 where X is the power of the creature tapped to pay", () => {
    const { game } = table();
    const wagon = spawn(game, "Keldon Battlewagon");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: wagon, abilityIndex: 0, targets: [], tap: [bears] });
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(pt(game, wagon)).toEqual({ power: 2, toughness: 3 });
  });

  it("is sacrificed at end of combat once it attacks", () => {
    const { game, a } = table();
    const wagon = spawn(game, "Keldon Battlewagon");
    attack(game, a, [wagon]);
    expect(zone(game, wagon)).toBe("graveyard");
  });
});

describe("Spitting Spider", () => {
  it("sacrifices a land to deal 1 damage to each creature with flying", () => {
    const { game } = table();
    const spider = spawn(game, "Spitting Spider");
    const land = spawn(game, "Forest");
    const bird = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    game.dispatch({ type: "activate-ability", player: A, source: spider, abilityIndex: 0, targets: [], sacrifice: land });
    settle(game);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, bird)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(graveyard(game, B)).toContain(bird);
  });
});

describe("Wintermoon Mesa", () => {
  it("taps two target lands", () => {
    const { game } = table();
    const mesa = spawn(game, "Wintermoon Mesa");
    expect(game.state.objects[mesa].tapped).toBe(true); // it enters tapped
    game.state.objects[mesa].tapped = false;
    lands(game, "Wastes", 2);
    const [x, y] = lands(game, "Forest", 2, B);
    activate(game, mesa, 1, { targets: [ref(x), ref(y)] });
    expect(zone(game, mesa)).toBe("graveyard");
    expect(game.state.objects[x].tapped).toBe(true);
    expect(game.state.objects[y].tapped).toBe(true);
  });
});

describe("Shrouded Serpent", () => {
  it("can't be blocked this turn when the defending player doesn't pay {4}", () => {
    const { game, a, b } = table();
    const serpent = spawn(game, "Shrouded Serpent");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: serpent }];
    pickModes(b);
    attack(game, a, [serpent]);
    expect(game.state.players[B].life).toBe(16);
  });
});
