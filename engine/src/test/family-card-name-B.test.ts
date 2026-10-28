import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], player = A) => game.state.zones.perPlayer[player].library;

describe("choose-card-name family, group B", () => {
  it("Wood Sage offers only creature names and takes every revealed card with the name", () => {
    const { game, a } = table();
    toLibrary(game, "Island");
    const bears2 = toLibrary(game, "Grizzly Bears");
    const elves = toLibrary(game, "Llanowar Elves");
    const bears1 = toLibrary(game, "Grizzly Bears");
    const sage = spawn(game, "Wood Sage");
    a.chooseCardNameFn = (_v, _s, options) => {
      expect(options).not.toContain("Lightning Bolt");
      expect(options).toContain("Grizzly Bears");
      return "Grizzly Bears";
    };
    activate(game, sage);
    expect(zone(game, bears1)).toBe("hand");
    expect(zone(game, bears2)).toBe("hand");
    expect(zone(game, elves)).toBe("graveyard");
    expect(graveyard(game).length).toBe(2);
  });

  it("Diviner's Lockbox: a hit sacrifices it and draws three; a miss leaves the card on top", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const box = spawn(game, "Diviner's Lockbox");
    lands(game, "Wastes", 2);
    a.chooseCardNameFn = () => "Shock";
    const before = hand(game).length;
    activate(game, box);
    expect(zone(game, box)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
    expect(library(game)[0]).toBe(bolt);

    game.state.objects[box].tapped = false;
    a.chooseCardNameFn = () => "Lightning Bolt";
    activate(game, box);
    expect(zone(game, box)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 3);
    expect(zone(game, bolt)).toBe("hand");
  });

  it("Foreshadow draws on a named mill, and again at the next upkeep", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt", B);
    lands(game, "Island", 2);
    const spell = toHand(game, "Foreshadow");
    a.chooseCardNameFn = () => "Lightning Bolt";
    const before = hand(game).length;
    cast(game, spell, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game).length).toBe(before); // -1 Foreshadow, +1 drawn
    nextTurn(game, "draw");
    // Bob's upkeep: the delayed draw is alice's.
    expect(hand(game).length).toBe(before + 1);
  });

  it("Foreshadow's miss draws nothing now", () => {
    const { game, a } = table();
    toLibrary(game, "Lightning Bolt", B);
    lands(game, "Island", 2);
    const spell = toHand(game, "Foreshadow");
    a.chooseCardNameFn = () => "Shock";
    const before = hand(game).length;
    cast(game, spell, { targets: [{ kind: "player", player: B }] });
    expect(hand(game).length).toBe(before - 1);
  });

  it("Lammastide Weave gains the named milled card's mana value, nothing on a miss, and draws", () => {
    const { game, a } = table();
    toLibrary(game, "Divination", B);
    lands(game, "Forest", 4);
    a.chooseCardNameFn = () => "Divination";
    const before = hand(game).length;
    cast(game, toHand(game, "Lammastide Weave"), { targets: [{ kind: "player", player: B }] });
    expect(life(game)).toBe(23);
    expect(hand(game).length).toBe(before + 1);

    toLibrary(game, "Divination", B);
    a.chooseCardNameFn = () => "Shock";
    cast(game, toHand(game, "Lammastide Weave"), { targets: [{ kind: "player", player: B }] });
    expect(life(game)).toBe(23);
  });
});
