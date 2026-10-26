import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Morningtide batch 1D", () => {
  it("Slithermuse, leaving, draws the difference to the chosen opponent's bigger hand", () => {
    const { game } = table();
    const muse = spawn(game, "Slithermuse");
    for (let i = 0; i < 4; i += 1) toHand(game, "Wastes", B);
    const before = hand(game, A).length;
    const difference = hand(game, B).length - before;
    expect(difference).toBeGreaterThan(0);
    destroy(game, muse);
    expect(zone(game, muse)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + difference);
  });

  it("Cloak and Dagger may attach itself to another player's entering Rogue", () => {
    const { game, a } = table();
    const cloak = spawn(game, "Cloak and Dagger");
    pickModes(a, 0);
    const rogue = enter(game, "Goblin Rogue Token", B);
    expect(game.state.objects[cloak].attachedTo).toBe(rogue);
    expect(controller(game, cloak)).toBe(A);
    expect(pt(game, rogue)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, rogue).has("shroud")).toBe(true);
  });

  it("Reach of Branches makes a Treefolk Shaman and returns to hand when a Forest enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const reach = toHand(game, "Reach of Branches");
    cast(game, reach);
    expect(tokensNamed(game, "Treefolk Shaman Token", A)).toBe(1);
    expect(zone(game, reach)).toBe("graveyard");
    pickModes(a, 0);
    enter(game, "Forest");
    expect(zone(game, reach)).toBe("hand");
  });

  it("Luminescent Rain gains 2 life for each permanent of the chosen type", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears");
    a.chooseCreatureTypeFn = () => "Elf";
    cast(game, toHand(game, "Luminescent Rain"));
    expect(life(game)).toBe(24);
  });

  it("Earthbrawn's reinforce discards it from hand for a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const brawn = toHand(game, "Earthbrawn");
    activate(game, brawn, 0, { targets: [ref(bears)] });
    expect(zone(game, brawn)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });

  it("Stenchskipper is sacrificed at the end step only without a Goblin", () => {
    const { game } = table();
    const skipper = spawn(game, "Stenchskipper");
    const goblin = spawn(game, "Goblin Rogue Token");
    toStep(game, "end");
    toStep(game, "precombat-main", B);
    expect(zone(game, skipper)).toBe("battlefield");
    destroy(game, goblin);
    toStep(game, "end", B);
    toStep(game, "precombat-main", A);
    expect(zone(game, skipper)).toBe("graveyard");
  });

  it("Rustic Clachan enters tapped without a Kithkin to reveal", () => {
    const { game } = table();
    const clachan = enter(game, "Rustic Clachan");
    expect(game.state.objects[clachan].tapped).toBe(true);
  });
});
