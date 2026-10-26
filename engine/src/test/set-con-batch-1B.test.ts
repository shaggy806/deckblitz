/**
 * Conflux and Shards of Alara (CON, ALA; B171), group B. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  controller,
  counters,
  destroy,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("CON group B", () => {
  it("Apocalypse Hydra: X counters, and another X once X is 5 or more", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    lands(game, "Forest", 4);
    const four = toHand(game, "Apocalypse Hydra");
    cast(game, four, { x: 4 });
    expect(counters(game, four)).toBe(4);
    const { game: g2 } = table();
    lands(g2, "Mountain", 5);
    lands(g2, "Forest", 4);
    const five = toHand(g2, "Apocalypse Hydra");
    cast(g2, five, { x: 5 });
    expect(counters(g2, five)).toBe(10);
  });

  it("Prince of Thralls: an opponent's permanent that dies comes back under your control unless they pay 3 life", () => {
    const { game, b } = table();
    spawn(game, "Prince of Thralls");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    const rats = spawn(game, "Typhoid Rats", B);
    pickModes(b, 0);
    destroy(game, rats);
    expect(zone(game, rats)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("Goblin Razerunners: at your end step it may deal damage equal to its +1/+1 counters", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const [land] = lands(game, "Wastes", 1);
    const goblin = spawn(game, "Goblin Razerunners");
    game.dispatch({ type: "activate-ability", player: A, source: goblin, abilityIndex: 0, targets: [], sacrifice: land });
    settle(game);
    expect(counters(game, goblin)).toBe(1);
    expect(zone(game, land)).toBe("graveyard");
    pickTargets(a, B);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("Bloodhall Ooze: one counter per colour you control at upkeep", () => {
    const { game, a } = table();
    const ooze = spawn(game, "Bloodhall Ooze");
    spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, ooze)).toBe(1);
    spawn(game, "Typhoid Rats");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, ooze)).toBe(3);
  });

  it("Dark Temper: 2 damage, or destroy with a black permanent", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Dark Temper"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    spawn(game, "Typhoid Rats");
    const giant2 = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Dark Temper"), { targets: [ref(giant2)] });
    expect(zone(game, giant2)).toBe("graveyard");
  });

  it("Yoke of the Damned: another creature dying destroys the enchanted creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Yoke of the Damned"), { targets: [ref(giant)] });
    const bears = spawn(game, "Grizzly Bears");
    expect(zone(game, giant)).toBe("battlefield");
    destroy(game, bears);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Drag Down: -1/-1 for each basic land type among your lands", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Drag Down"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });

  it("Toxic Iguanar: deathtouch only while you control a green permanent", () => {
    const { game } = table();
    const iguanar = spawn(game, "Toxic Iguanar");
    expect(keywords(game, iguanar).has("deathtouch")).toBe(false);
    spawn(game, "Grizzly Bears");
    expect(keywords(game, iguanar).has("deathtouch")).toBe(true);
  });
});
