import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  enter,
  hand,
  lands,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Journey into Nyx — group A", () => {
  it("Launch the Fleet costs {1} more for the second target, and a granted creature's attack makes an attacking Soldier", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const knight = spawn(game, "White Knight");
    cast(game, toHand(game, "Launch the Fleet"), { targets: [ref(bears), ref(knight)] });
    expect(plains.every((id) => game.state.objects[id].tapped)).toBe(true);
    attack(game, a, [bears]);
    const soldiers = named(game, "Soldier Token", A);
    expect(soldiers).toHaveLength(1);
    expect(game.state.objects[soldiers[0]].tapped).toBe(true);
  });

  it("Hour of Need gives each exiled creature's controller a 4/4 Sphinx", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Hour of Need"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "4/4 Blue Sphinx Token (Flying)", A)).toBe(1);
    expect(tokensNamed(game, "4/4 Blue Sphinx Token (Flying)", B)).toBe(1);
  });

  it("Interpret the Signs draws cards equal to the revealed card's mana value", () => {
    const { game } = table();
    lands(game, "Island", 6);
    toLibrary(game, "Craw Wurm"); // mana value 6
    const spell = toHand(game, "Interpret the Signs");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 6);
  });

  it("Feast of Dreams takes an enchantment creature or an enchanted creature, not a plain one", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const plain = spawn(game, "Grizzly Bears", B);
    const naiads = spawn(game, "Whitewater Naiads", B);
    expect(() => cast(game, toHand(game, "Feast of Dreams"), { targets: [ref(plain)] })).toThrow();
    cast(game, toHand(game, "Feast of Dreams"), { targets: [ref(naiads)] });
    expect(zone(game, naiads)).toBe("graveyard");
  });

  it("Skybind exiles a nonenchantment permanent as it enters and returns it at the next end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Skybind");
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });

  it("Tethmos High Priest's heroic returns a small creature card from the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const priest = spawn(game, "Tethmos High Priest");
    const dead = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, dead);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(priest)] });
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(pt(game, priest).power).toBe(5);
  });

  it("Leonin Iconoclast's heroic destroys an opponent's enchantment creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const cat = spawn(game, "Leonin Iconoclast");
    const naiads = spawn(game, "Whitewater Naiads", B);
    pickTargets(a, naiads);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(cat)] });
    expect(zone(game, naiads)).toBe("graveyard");
  });

  it("Hall of Triumph pumps only creatures of the chosen colour", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const green = spawn(game, "Grizzly Bears");
    const white = spawn(game, "White Knight");
    const hall = toHand(game, "Hall of Triumph");
    game.dispatch({ type: "cast-spell", player: A, card: hall, targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "G" });
    settle(game);
    expect(pt(game, green)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, white)).toEqual({ power: 2, toughness: 2 });
  });
});
