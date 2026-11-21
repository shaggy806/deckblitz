/**
 * The Curse of Fenric: chapter I is "for each player, destroy up to one target
 * creature that player controls", then a token for the controller of each
 * creature destroyed this way — a `for-each-target` over the slots with
 * `only: { thisWay: "destroyed" }` and `"target-controller"` on the bound slot
 * (rule 111.11). An indestructible target isn't destroyed, so its controller
 * gets nothing. Chapter II names the creature (`become`'s `name`), which
 * chapter III's "named Fenric" reads.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, D, enter, keywords, named, pickTargets, pt, settle, spawn, subtypes, table, toStep, tokensNamed, zone } from "./harness.js";
import { effectiveSupertypes } from "../characteristics.js";
import { nameOf } from "../state.js";

const MUTANT = "Mutant Token (Green, Deathtouch)";

describe("The Curse of Fenric", () => {
  it("I: each destroyed creature's controller gets a 3/3 deathtouch Mutant; an indestructible one's doesn't", () => {
    const { game, a } = table({ players: 4 });
    const mine = spawn(game, "Grizzly Bears", A);
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Darksteel Myr", C); // indestructible
    spawn(game, "Gray Ogre", D); // dave's slot left blank
    pickTargets(a, mine, bobs, carols, null);
    enter(game, "The Curse of Fenric");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("battlefield");
    expect(tokensNamed(game, MUTANT, A)).toBe(1);
    expect(tokensNamed(game, MUTANT, B)).toBe(1);
    expect(tokensNamed(game, MUTANT, C)).toBe(0);
    expect(tokensNamed(game, MUTANT, D)).toBe(0);
    const [token] = named(game, MUTANT, B);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
  });

  it("II makes a nontoken creature a 6/6 legendary Horror named Fenric with no abilities; III has a Mutant fight it", () => {
    const { game, a } = table();
    const bobs = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", A); // alice's slot, left blank
    pickTargets(a, null, bobs);
    enter(game, "The Curse of Fenric");
    const [mutant] = named(game, MUTANT, B);
    const target = spawn(game, "Serra Angel", B);
    pickTargets(a, target);
    toStep(game, "precombat-main");
    settle(game);
    expect(nameOf(game.state.objects[target])).toBe("Fenric");
    expect(pt(game, target)).toEqual({ power: 6, toughness: 6 });
    expect(subtypes(game, target)).toEqual(["Horror"]);
    expect(effectiveSupertypes(game.state, game.registry, game.state.objects[target])).toContain("legendary");
    expect(keywords(game, target).has("flying")).toBe(false);
    pickTargets(a, mutant, target);
    toStep(game, "precombat-main");
    settle(game);
    // Deathtouch kills Fenric; 6 damage kills the 3/3.
    expect(zone(game, target)).toBe("graveyard");
    expect(game.battlefield).not.toContain(mutant);
    expect(tokensNamed(game, MUTANT)).toBe(0);
  });
});
