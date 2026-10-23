import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
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
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

// Oath of the Gatewatch / Commander 2015, group B, plus older cards unblocked
// by "if it would die this turn, exile it instead".

describe("Kozilek's Return", () => {
  it("from the graveyard: casting a 7+ mana value Eldrazi creature may exile it to deal 5 to each creature", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Kozilek's Return");
    const bears = spawn(game, "Grizzly Bears", B);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    lands(game, "Wastes", 8);
    pickModes(a, 0);
    const crusher = toHand(game, "Ulamog's Crusher");
    cast(game, crusher);
    expect(zone(game, card)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, maw)).toBe("battlefield");
    expect(game.state.objects[maw].damageMarked).toBe(5);
    // The trigger resolved before the Eldrazi did (the rulings).
    expect(zone(game, crusher)).toBe("battlefield");
    expect(game.state.objects[crusher].damageMarked).toBe(0);
  });
});

describe("Vile Redeemer", () => {
  it("paying {C} as it's cast makes a Scion for each nontoken creature that died under your control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    // A real token (Scion Summoner's), which doesn't count.
    enter(game, "Scion Summoner");
    const scion = game.battlefield.find((id) => game.state.objects[id].isToken)!;
    destroy(game, bears);
    destroy(game, scion);
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(0);
    spawn(game, "Grizzly Bears", B);
    destroy(game, game.battlefield.find((id) => game.state.objects[id].controller === B)!);
    lands(game, "Forest", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Vile Redeemer"), { settle: false });
    lands(game, "Wastes", 1);
    settle(game);
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });
});

describe("General Tazri", () => {
  it("pumps Allies you control by the number of colors among them, read on resolution", () => {
    const { game } = table();
    const tazri = spawn(game, "General Tazri");
    const trainer = spawn(game, "Weapons Trainer");
    const bears = spawn(game, "Grizzly Bears");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    activate(game, tazri, 0);
    expect(pt(game, tazri)).toEqual({ power: 5, toughness: 6 });
    expect(pt(game, trainer)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Gigantoplasm", () => {
  it("enters as a copy with \"{X}: base power and toughness X/X\"", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    a.chooseCopyFn = (_view, _source, options) => options[0] ?? null;
    lands(game, "Island", 9);
    const plasm = toHand(game, "Gigantoplasm");
    cast(game, plasm);
    expect(game.state.objects[plasm].copyOf).toBe("Grizzly Bears");
    expect(pt(game, plasm)).toEqual({ power: 2, toughness: 2 });
    activate(game, plasm, 0, { x: 5 });
    expect(pt(game, plasm)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Captain's Claws", () => {
  it("+1/+0, and a Kor Ally enters tapped and attacking when the equipped creature attacks", () => {
    const { game, a } = table();
    const claws = spawn(game, "Captain's Claws");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    activate(game, claws, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Kor Ally Token", A)).toBe(1);
    expect(life(game, B)).toBe(16);
  });
});

describe("Weapons Trainer", () => {
  it("other creatures you control get +1/+0 only while you control an Equipment", () => {
    const { game } = table();
    const trainer = spawn(game, "Weapons Trainer");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Bonesplitter");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, trainer)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Reaver Drone", () => {
  it("loses you 1 life each upkeep unless you control another colorless creature", () => {
    const { game } = table();
    spawn(game, "Reaver Drone");
    toStep(game, "draw");
    expect(life(game, A)).toBe(19);
    spawn(game, "Ornithopter");
    toStep(game, "draw");
    expect(life(game, A)).toBe(19);
  });
});

describe("Harvester Troll", () => {
  it("may sacrifice a land for two +1/+1 counters", () => {
    const { game, a } = table();
    const [land] = lands(game, "Wastes", 1);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [land];
    const troll = enter(game, "Harvester Troll");
    expect(zone(game, land)).toBe("graveyard");
    expect(counters(game, troll)).toBe(2);
  });
});

describe("Thought Harvester", () => {
  it("casting a colorless spell makes target opponent exile their top card", () => {
    const { game, a } = table();
    spawn(game, "Thought Harvester");
    pickTargets(a, B);
    const before = game.state.zones.perPlayer[B].library.length;
    cast(game, toHand(game, "Ornithopter"));
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 1);
  });
});

describe("Roiling Waters", () => {
  it("bounces up to two opponents' creatures and target player draws two", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Roiling Waters");
    const before = hand(game, A).length;
    cast(game, spell, { targets: [ref(bears), null, ref(A)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, A).length).toBe(before - 1 + 2);
  });
});

describe("Bouncer's Beatdown", () => {
  it("costs {2} less against a black permanent and deals the greatest power among your creatures, exiling it", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    spawn(game, "Colossal Dreadmaw");
    const corpse = spawn(game, "Walking Corpse", B);
    cast(game, toHand(game, "Bouncer's Beatdown"), { targets: [ref(corpse)] });
    expect(zone(game, corpse)).toBe("exile");
  });
});

describe("Necrotic Wound", () => {
  it("-X/-X for each creature card in your graveyard, and the creature is exiled if it would die", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Necrotic Wound"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Smite the Deathless", () => {
  it("takes indestructible away, so its damage kills — and the creature is exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const myr = spawn(game, "Darksteel Myr", B);
    cast(game, toHand(game, "Smite the Deathless"), { targets: [ref(myr)] });
    expect(zone(game, myr)).toBe("exile");
  });
});
