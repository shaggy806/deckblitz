import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  enter,
  graveyard,
  hand,
  life,
  lands,
  nextTurn,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

// Conspire (rule 702.78a): "As an additional cost to cast this spell, you may
// tap two untapped creatures you control that each share a color with it"
// and "When you cast this spell, if its conspire cost was paid, copy it." The
// caster is asked once the spell is on the stack — whether to pay (a
// `choose-modes` of one mode or none), then which two creatures. Printed
// (Burn Trail) or granted (Wort, the Raidmother), each instance paid and
// copying separately (702.78b).

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("conspire", () => {
  it("paid: two red creatures tap, even summoning-sick ones, and Burn Trail is copied", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const g1 = spawn(game, "Raging Goblin", A, { sick: true });
    const g2 = spawn(game, "Goblin Piker", A, { sick: true });
    pickModes(a, 0);
    const seen = pickPermanents(a, g1, g2);
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    cast(game, toHand(game, "Burn Trail"), { targets: [ref(B)] });
    expect(seen.offered).toEqual(expect.arrayContaining([g1, g2]));
    expect(tapped(game, g1)).toBe(true);
    expect(tapped(game, g2)).toBe(true);
    expect(life(game, B)).toBe(14);
  });

  it("declined: nothing taps and the spell resolves once", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const g1 = spawn(game, "Raging Goblin");
    spawn(game, "Goblin Piker");
    pickModes(a);
    cast(game, toHand(game, "Burn Trail"), { targets: [ref(B)] });
    expect(tapped(game, g1)).toBe(false);
    expect(life(game, B)).toBe(17);
  });

  it("isn't asked without two untapped creatures that share a colour with the spell", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Grizzly Bears");
    spawn(game, "Raging Goblin");
    spawn(game, "Goblin Piker", A, { tapped: true });
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    cast(game, toHand(game, "Burn Trail"), { targets: [ref(B)] });
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(17);
  });

  it("a hybrid spell shares either colour: a blue and a black creature pay for Memory Sluice", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const merfolk = spawn(game, "Coral Merfolk");
    const zombies = spawn(game, "Scathe Zombies");
    pickModes(a, 0);
    pickPermanents(a, merfolk, zombies);
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    const library = game.state.zones.perPlayer[B].library.length;
    cast(game, toHand(game, "Memory Sluice"), { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library.length).toBe(library - 8);
  });

  it("the copy may take a new target: Gleeful Sabotage destroys two artifacts", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const e1 = spawn(game, "Llanowar Elves");
    const e2 = spawn(game, "Llanowar Elves");
    const one = spawn(game, "Sol Ring", B);
    const two = spawn(game, "Sol Ring", B);
    pickModes(a, 0);
    pickPermanents(a, e1, e2);
    a.chooseTargetsFn = () => [{ kind: "object", object: two }];
    cast(game, toHand(game, "Gleeful Sabotage"), { targets: [ref(one)] });
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
  });

  it("Giantbaiting's copy makes a second Giant, and each is exiled at the end step", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const g1 = spawn(game, "Raging Goblin");
    const g2 = spawn(game, "Llanowar Elves");
    pickModes(a, 0);
    pickPermanents(a, g1, g2);
    cast(game, toHand(game, "Giantbaiting"));
    expect(tokensNamed(game, "Giant Warrior Token")).toBe(2);
    nextTurn(game);
    expect(tokensNamed(game, "Giant Warrior Token")).toBe(0);
  });

  it("Disturbing Plot's copy returns a second creature card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const z1 = spawn(game, "Scathe Zombies");
    const z2 = spawn(game, "Scathe Zombies");
    const bears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    pickModes(a, 0);
    pickPermanents(a, z1, z2);
    a.chooseTargetsFn = () => [{ kind: "object", object: lions }];
    cast(game, toHand(game, "Disturbing Plot"), { targets: [ref(bears)] });
    expect(hand(game)).toEqual(expect.arrayContaining([bears, lions]));
    expect(graveyard(game)).not.toContain(bears);
  });
});

describe("Wort, the Raidmother", () => {
  it("makes two red and green Goblin Warriors, and gives a red instant conspire", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    enter(game, "Wort, the Raidmother");
    expect(tokensNamed(game, "Goblin Warrior Token")).toBe(2);
    pickModes(a, 0);
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 2);
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });

  it("doesn't give a blue spell conspire", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    enter(game, "Wort, the Raidmother");
    spawn(game, "Coral Merfolk");
    spawn(game, "Coral Merfolk");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Opt"));
    settle(game);
    expect(asked).toBe(false);
  });

  it("a second instance on Burn Trail is paid separately: four creatures, two copies (702.78b)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    enter(game, "Wort, the Raidmother");
    spawn(game, "Raging Goblin");
    spawn(game, "Goblin Piker");
    let asks = 0;
    a.chooseModesFn = () => {
      asks += 1;
      return [0];
    };
    a.choosePermanentsFn = (_view, eligible) => {
      const untapped = eligible.filter((id) => !game.state.objects[id].tapped);
      return untapped.slice(0, 2);
    };
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    cast(game, toHand(game, "Burn Trail"), { targets: [ref(B)] });
    expect(asks).toBe(2);
    expect(life(game, B)).toBe(20 - 9);
  });
});

describe("Traitor's Roar", () => {
  it("taps the creature, which deals damage equal to its power to its controller", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Traitor's Roar"), { targets: [ref(bears)] });
    expect(tapped(game, bears)).toBe(true);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});
