/**
 * Guilds of Ravnica, group B: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
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

describe("Risk Factor", () => {
  it("the targeted opponent may take 4 damage", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    pickModes(b, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Risk Factor"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(hand(game)).toHaveLength(before);
  });

  it("if they don't, the caster draws three", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    pickModes(b, 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Risk Factor"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(hand(game)).toHaveLength(before + 3);
  });
});

describe("Mausoleum Secrets", () => {
  it("offers only black cards with mana value up to the creature cards in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears", B);
    const blade = toLibrary(game, "Doom Blade");
    const murder = toLibrary(game, "Murder");
    lands(game, "Swamp", 2);
    const seen = pickFromZone(a, blade);
    cast(game, toHand(game, "Mausoleum Secrets"));
    expect(seen.offered).toContain(blade);
    expect(seen.offered).not.toContain(murder);
    expect(zone(game, blade)).toBe("hand");
  });
});

describe("Severed Strands", () => {
  it("gains life equal to the sacrificed creature's toughness and destroys the target", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Severed Strands"), { sacrifice: giant, targets: [ref(theirs)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });
});

describe("Venerated Loxodon", () => {
  it("puts a +1/+1 counter on each creature that convoked it", () => {
    const { game } = table();
    const convokers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const idle = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Venerated Loxodon"), {
      convoke: convokers.map((creature) => ({ creature, pays: "generic" as const })),
    });
    expect(convokers.map((id) => counters(game, id))).toEqual([1, 1]);
    expect(counters(game, idle)).toBe(0);
  });
});

describe("Molderhulk", () => {
  it("costs {1} less for each creature card in your graveyard, then returns a land", () => {
    const { game, a } = table();
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    const land = toGraveyard(game, "Forest");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 5);
    pickTargets(a, land);
    cast(game, toHand(game, "Molderhulk"));
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Molderhulk")).toBe(true);
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Kraul Foragers", () => {
  it("gains 1 life for each creature card in your graveyard only", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears", B);
    enter(game, "Kraul Foragers");
    expect(life(game)).toBe(22);
  });
});

describe("Street Riot", () => {
  it("pumps and grants trample only during your turn", () => {
    const { game } = table();
    spawn(game, "Street Riot");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Leapfrog", () => {
  it("has flying once you've cast an instant this turn", () => {
    const { game } = table();
    const frog = spawn(game, "Leapfrog");
    expect(keywords(game, frog).has("flying")).toBe(false);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Radical Idea"));
    expect(keywords(game, frog).has("flying")).toBe(true);
  });
});

describe("Garrison Sergeant", () => {
  it("has double strike while you control a Gate", () => {
    const { game } = table();
    const sergeant = spawn(game, "Garrison Sergeant");
    expect(keywords(game, sergeant).has("double-strike")).toBe(false);
    spawn(game, "Azorius Guildgate");
    expect(keywords(game, sergeant).has("double-strike")).toBe(true);
  });
});

describe("Vigorspore Wurm", () => {
  it("gives the target vigilance and +X/+X for the creature cards in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Vigorspore Wurm");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });
});

describe("Book Devourer", () => {
  it("on combat damage, may discard the hand and draw that many", () => {
    const { game, a } = table();
    const devourer = spawn(game, "Book Devourer");
    pickModes(a, 0);
    const before = hand(game).length;
    const gyBefore = graveyard(game).length;
    attack(game, a, [devourer]);
    expect(life(game, B)).toBe(16);
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(gyBefore + before);
  });
});

describe("Quasiduplicate", () => {
  it("jump-starts from the graveyard to copy a creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const card = toGraveyard(game, "Quasiduplicate");
    pickTargets(a, bears);
    cast(game, card, { via: "flashback", targets: [ref(bears)] });
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears")).toHaveLength(2);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Assure // Assemble", () => {
  it("Assure puts a counter on the target and makes it indestructible", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    const card = toHand(game, "Assure // Assemble");
    cast(game, card, { face: 1, targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("Assemble makes three Elf Knights", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Assure // Assemble"), { face: 2 });
    expect(tokensNamed(game, "Elf Knight Token", A)).toBe(3);
  });
});
