import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  destroy,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Apocalypse batch 1D", () => {
  it("Whirlpool Rider shuffles the hand away and draws as many", () => {
    const { game } = table();
    const bears = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    const library = game.state.zones.perPlayer[A].library.length;
    enter(game, "Whirlpool Rider");
    expect(hand(game).length).toBe(before);
    expect(game.state.zones.perPlayer[A].library.length).toBe(library);
    expect(["hand", "library"]).toContain(zone(game, bears));
  });

  it("Sylvan Messenger takes every revealed Elf", () => {
    const { game } = table();
    const elf = toLibrary(game, "Llanowar Elves");
    const before = hand(game).length;
    enter(game, "Sylvan Messenger");
    expect(zone(game, elf)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Penumbra Wurm leaves a black 6/6 trampling Wurm", () => {
    const { game } = table();
    const wurm = spawn(game, "Penumbra Wurm");
    destroy(game, wurm);
    expect(tokensNamed(game, "Wurm Token (black 6/6 trample)", A)).toBe(1);
  });

  it("Wild Research finds an instant, then discards a card at random", () => {
    const { game, a } = table();
    const research = spawn(game, "Wild Research");
    lands(game, "Island", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = (_v, eligible) => (eligible.includes(bolt) ? [bolt] : []);
    const before = hand(game).length;
    activate(game, research, 1);
    expect(hand(game).length).toBe(before);
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(1);
  });

  it("Bloodfire Colossus deals 6 to each creature and each player", () => {
    const { game } = table();
    const colossus = spawn(game, "Bloodfire Colossus");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    activate(game, colossus);
    expect(zone(game, colossus)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(14);
    expect(life(game, B)).toBe(14);
  });

  it("Chaos stops creatures that enter later from blocking", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Order // Chaos"), { face: 2 });
    const late = spawn(game, "Grizzly Bears", B);
    expect(game.viewFor(A).objects[late]?.restrictions).toContain("cant-block");
  });

  it("Jaded Response counters only a spell sharing a colour with a creature you control", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 4);
    spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Jaded Response"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(17);

    spawn(game, "Raging Goblin");
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Jaded Response"), { targets: [ref(shock)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("Ceta Sanctuary draws two with red and green, one with only red", () => {
    const both = table().game;
    spawn(both, "Ceta Sanctuary");
    spawn(both, "Raging Goblin");
    spawn(both, "Grizzly Bears");
    const lib = both.state.zones.perPlayer[A].library.length;
    toStep(both, "draw");
    // Two at upkeep, one in the draw step.
    expect(both.state.zones.perPlayer[A].library.length).toBe(lib - 3);

    const one = table().game;
    spawn(one, "Ceta Sanctuary");
    spawn(one, "Raging Goblin");
    const lib1 = one.state.zones.perPlayer[A].library.length;
    toStep(one, "draw");
    expect(one.state.zones.perPlayer[A].library.length).toBe(lib1 - 2);

    const none = table().game;
    spawn(none, "Ceta Sanctuary");
    const lib0 = none.state.zones.perPlayer[A].library.length;
    toStep(none, "draw");
    expect(none.state.zones.perPlayer[A].library.length).toBe(lib0 - 1);
  });

  it("Haunted Angel is exiled and each other player gets a black Angel", () => {
    const { game } = table({ players: 3 });
    const angel = spawn(game, "Haunted Angel");
    destroy(game, angel);
    expect(zone(game, angel)).toBe("exile");
    expect(tokensNamed(game, "Angel Token (black 3/3 flying)", A)).toBe(0);
    expect(tokensNamed(game, "Angel Token (black 3/3 flying)", B)).toBe(1);
    expect(tokensNamed(game, "Angel Token (black 3/3 flying)", C)).toBe(1);
  });

  it("Yavimaya's Embrace takes the creature and pumps it", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Yavimaya's Embrace"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Putrid Warrior's damage makes each player lose 1 life", () => {
    const { game, a } = table();
    const warrior = spawn(game, "Putrid Warrior");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: warrior, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(19);
  });

  it("Strength of Night kicked gives Zombies +3/+3, others +1/+1", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Swamp", 1);
    const zombie = spawn(game, "Grave Defiler");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Strength of Night"), { kicked: true });
    expect(pt(game, zombie)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Coastal Drake can target only a Kavu", () => {
    const { game } = table();
    const drake = spawn(game, "Coastal Drake");
    lands(game, "Island", 2);
    const kavu = spawn(game, "Flametongue Kavu", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, drake, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, drake, 0, { targets: [ref(kavu)] });
    expect(zone(game, kavu)).toBe("hand");
  });
});
