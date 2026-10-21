/**
 * Throne of Eldraine adamant, batch 1G — and the other "mana of each colour
 * spent to cast it" cards it unblocked: the Ikoria Mythos cycle, the Lorwyn
 * Eclipsed Incarnations' evoke-era "if {X}{X} was spent", Void Mirror.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const myTokens = (game: ReturnType<typeof table>["game"]) =>
  game.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].controller === A);

describe("ELD adamant batch 1G", () => {
  it("Clockwork Servant draws only off three mana of one colour", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Clockwork Servant"));
    expect(hand(game).length).toBe(before + 1);
    lands(game, "Swamp", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const after = hand(game).length;
    cast(game, toHand(game, "Clockwork Servant"));
    expect(hand(game).length).toBe(after);
  });

  it("Slaying Fire deals 4 with three red spent, 3 otherwise", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Slaying Fire"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Slaying Fire"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
  });

  it("Searing Barrage's adamant damages the creature's controller as well", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Searing Barrage"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    const other = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Searing Barrage"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("Sundering Stroke divides 7, or deals 7 to each with seven red", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Sundering Stroke"), { targets: [ref(giant), ref(B)], division: [3, 4] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    const other = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Sundering Stroke"), { targets: [ref(other), ref(B)], division: [6, 1] });
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game, B)).toBe(9);
  });

  it("Once and Future: the second card goes on top, or to hand with adamant; it exiles itself", () => {
    const { game } = table();
    const marker = toLibrary(game, "Hill Giant");
    const lib = game.state.zones.perPlayer[A].library;
    const topFirst = lib.indexOf(marker) === 0;
    const top = (): string => {
      const l = game.state.zones.perPlayer[A].library;
      return l[topFirst ? 0 : l.length - 1];
    };
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Llanowar Elves");
    lands(game, "Forest", 1);
    lands(game, "Wastes", 3);
    const spell = toHand(game, "Once and Future");
    cast(game, spell, { targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(top()).toBe(two);
    expect(zone(game, spell)).toBe("exile");

    const three = toGraveyard(game, "Grizzly Bears");
    const four = toGraveyard(game, "Llanowar Elves");
    lands(game, "Forest", 3);
    lands(game, "Wastes", 1);
    const again = toHand(game, "Once and Future");
    cast(game, again, { targets: [ref(three), ref(four)] });
    expect(zone(game, three)).toBe("hand");
    expect(zone(game, four)).toBe("hand");
    expect(zone(game, again)).toBe("exile");
  });

  it("Cauldron's Gift returns a creature card it just milled, with a +1/+1 counter", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : []);
    lands(game, "Swamp", 3);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Cauldron's Gift"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });

  it("Cauldron's Gift without adamant mills nothing", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const before = graveyard(game).length;
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Cauldron's Gift"));
    expect(zone(game, bears)).toBe("library");
    expect(graveyard(game).length).toBe(before + 1);
  });

  it("Rally for the Throne gains 1 life per creature, counting the new Humans", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Rally for the Throne"));
    expect(tokensNamed(game, "Human Token", A)).toBe(2);
    expect(life(game)).toBe(23);
  });

  it("Mythos of Brokkos with {U}{B}: entombs a card, then may return it", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : []);
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Mythos of Brokkos"));
    expect(zone(game, bears)).toBe("hand");
  });

  it("Mythos of Nethroi destroys a noncreature only with {G}{W} spent", () => {
    const { game } = table();
    const rock = spawn(game, "Mind Stone", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Mythos of Nethroi"), { targets: [ref(rock)] });
    expect(zone(game, rock)).toBe("battlefield");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Mythos of Nethroi"), { targets: [ref(rock)] });
    expect(zone(game, rock)).toBe("graveyard");
  });

  it("Mythos of Illuna with {R}{G}: the token copy fights", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Mythos of Illuna"), { targets: [ref(giant)] });
    const mine = myTokens(game);
    expect(mine).toHaveLength(1);
    expect(pt(game, mine[0])).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Mythos of Illuna without {R}{G}: a plain copy", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Mythos of Illuna"), { targets: [ref(giant)] });
    expect(myTokens(game)).toHaveLength(1);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Void Mirror counters a spell with no coloured mana spent", () => {
    const { game } = table();
    spawn(game, "Void Mirror", B);
    lands(game, "Wastes", 3);
    const walker = toHand(game, "Henge Walker");
    cast(game, walker);
    expect(zone(game, walker)).toBe("graveyard");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const other = toHand(game, "Henge Walker");
    cast(game, other);
    expect(zone(game, other)).toBe("battlefield");
  });

  it("Vibrance evoked with {R}{R}: 3 damage, no search, then sacrificed", () => {
    const { game, a } = table();
    pickTargets(a, B);
    lands(game, "Mountain", 2);
    const before = hand(game).length;
    const vibrance = toHand(game, "Vibrance");
    cast(game, vibrance, { evoke: true });
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(20);
    expect(hand(game).length).toBe(before);
    expect(zone(game, vibrance)).toBe("graveyard");
  });

  it("Emptiness cast with {W}{W}: reanimates, and no -1/-1 trigger", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    lands(game, "Plains", 2);
    lands(game, "Wastes", 4);
    const emptiness = toHand(game, "Emptiness");
    cast(game, emptiness);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, giant, "-1/-1")).toBe(0);
    expect(zone(game, emptiness)).toBe("battlefield");
  });
});
